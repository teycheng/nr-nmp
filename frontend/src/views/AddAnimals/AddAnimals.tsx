/**
 * @summary This is the Add Animal list Tab
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { Button, ButtonGroup } from '@bcgov/design-system-react-components';
import {
  customTableStyle,
  tableActionButtonCss,
  addRecordGroupStyle,
  ErrorText,
} from '../../common.styles';
import useAppState from '@/hooks/useAppState';
import { Tabs, View } from '@/components/common';
import { Animal, NMPFileAnimal } from '@/types';
import { FARM_INFORMATION, MANURE_IMPORTS } from '@/constants/routes';
import { DoubleRowStyle, specialTableRowStyle } from './addAnimals.styles';
import AddAnimalsModal from './AddAnimalsModal';
import { isDairyAndMilkingCattle, liquidSolidManureDisplay } from '@/utils/utils';
import { calculateAnnualWashWater } from './utils';
import { APICacheContext } from '@/context/APICacheContext';
import { DAIRY_COW_ID } from '@/constants';
import { FeedbackWidget } from '@capslock/feedback-widget';

export default function AddAnimals() {
  const { state, dispatch } = useAppState();
  const apiCache = useContext(APICacheContext);
  const [rowEditIndex, setRowEditIndex] = useState<number | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showViewError, setShowViewError] = useState<string>('');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const [animalList, setAnimalList] = useState<NMPFileAnimal[]>(
    state.nmpFile.years[0].farmAnimals || [],
  );

  useEffect(() => {
    dispatch({ type: 'SET_SHOW_ANIMALS_STEP', showAnimalsStep: true });

    apiCache.callEndpoint('/api/animals/').then((response: { status?: any; data: any }) => {
      if (response.status === 200) {
        const { data } = response;
        setAnimals(data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasDairyCattle = useMemo(
    () =>
      state.nmpFile.years[0].farmAnimals?.some(
        (animal: NMPFileAnimal) => animal.animalId === DAIRY_COW_ID,
      ),
    [state.nmpFile.years],
  );

  const tabs = useMemo(
    () =>
      hasDairyCattle
        ? ['Add Animals', 'Manure & Imports', 'Storage', 'Nutrient Analysis']
        : ['Add Animals', 'Manure & Imports', 'Nutrient Analysis'],
    [hasDairyCattle],
  );

  const handleEditRow = React.useCallback((e: { id: GridRowId; api: GridApiCommunity }) => {
    setRowEditIndex(e.api.getRowIndexRelativeToVisibleRows(e.id));
    setIsDialogOpen(true);
  }, []);

  const handleDeleteRow = (e: { id: GridRowId; api: GridApiCommunity }) => {
    setAnimalList((prev) => {
      const index = e.api.getRowIndexRelativeToVisibleRows(e.id);
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setRowEditIndex(undefined);
  };

  const handleNextPage = () => {
    if (animalList.length) {
        dispatch({
            type: 'SAVE_ANIMALS',
            year: state.nmpFile.farmDetails.year,
            newAnimals: animalList,
        });
        if (hasDairyCattle) {
            setIsFeedbackOpen(true);
        } else {
            navigate(MANURE_IMPORTS);
        }
    } else {
        setShowViewError('You must add at least one animal before continuing.');
    }
};

  const handlePreviousPage = () => {
    if (animalList.length) {
      dispatch({
        type: 'SAVE_ANIMALS',
        year: state.nmpFile.farmDetails.year,
        newAnimals: animalList,
      });
    }
    navigate(FARM_INFORMATION);
  };

  // Same columns are in ManureAndImports.tsx
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'animalId',
        headerName: 'Animal Type',
        width: 175,
        valueGetter: (val: any) => animals.find((ele) => String(ele.id) === val)?.name || val,
        renderCell: (params: any) => {
          if (isDairyAndMilkingCattle(params.row.animalId, params.row.subtype)) {
            return (
              <span css={specialTableRowStyle}>
                <DoubleRowStyle>{params.value}</DoubleRowStyle>
                <DoubleRowStyle>Milking center wash water</DoubleRowStyle>
              </span>
            );
          }
          return <div>{params.value}</div>;
        },
        sortable: false,
      },
      {
        field: 'manureData',
        headerName: 'Annual Manure',
        width: 200,
        minWidth: 155,
        maxWidth: 300,
        valueGetter: (params: any) => liquidSolidManureDisplay(params),
        renderCell: (params: any) => {
          const { animalId, animalsPerFarm, subtype, washWater, washWaterUnit } = params.row;
          if (isDairyAndMilkingCattle(animalId, subtype)) {
            const washWaterGallons = calculateAnnualWashWater(
              washWater,
              washWaterUnit,
              animalsPerFarm,
            );
            return (
              <span css={specialTableRowStyle}>
                <DoubleRowStyle>{params.value}</DoubleRowStyle>
                <DoubleRowStyle>{washWaterGallons} U.S. gallons</DoubleRowStyle>
              </span>
            );
          }
          return <div>{params.value}</div>;
        },
        sortable: false,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        renderCell: (row: any) => (
          <>
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleEditRow(row)}
              icon={faEdit}
              aria-label="Edit"
            />
            <FontAwesomeIcon
              css={tableActionButtonCss}
              onClick={() => handleDeleteRow(row)}
              icon={faTrash}
              aria-label="Delete"
            />
          </>
        ),
        sortable: false,
      },
    ],
    [handleEditRow, animals],
  );

  return (
    <View
      title="Livestock Information"
      handleBack={handlePreviousPage}
      handleNext={handleNextPage}
    >
      <div css={addRecordGroupStyle}>
        <ButtonGroup
          alignment="end"
          ariaLabel="A group of buttons"
          orientation="horizontal"
        >
          <Button
            size="medium"
            onPress={() => setIsDialogOpen(true)}
            variant="secondary"
          >
            Add Animal
          </Button>
        </ButtonGroup>
      </div>
      {isDialogOpen && (
        <AddAnimalsModal
          initialModalData={rowEditIndex !== undefined ? animalList[rowEditIndex] : undefined}
          rowEditIndex={rowEditIndex}
          setAnimalList={setAnimalList}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          modalStyle={{ width: '700px' }}
        />
      )}
      <Tabs
        activeTab={0}
        tabLabel={tabs}
      />
      <DataGrid
        sx={{ ...customTableStyle, marginTop: '1.25rem' }}
        rows={animalList}
        columns={columns}
        getRowId={() => crypto.randomUUID()}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooterPagination
        hideFooter
      />
      <ErrorText>{showViewError}</ErrorText>
      
      {isFeedbackOpen && (
    <FeedbackWidget
        formId={2}
        apiUrl="http://localhost:3000"
        onClose={() => navigate(MANURE_IMPORTS)}
    />)}
      
    </View>
  );
}