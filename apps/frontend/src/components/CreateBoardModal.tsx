import React from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    Fade,
    CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomTextField from './CustomTextField';
import { useBoard } from '@utils/useBoard';

type CreateBoardForm = {
    name: string;
    description: string;
};

type CreateBoardModalProps = {
    open: boolean;
    onClose: () => void;
};

const schema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required'),
});

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
    open,
    onClose,
}) => {
    const {
        createBoard,
        createBoardsStatus
    } = useBoard()
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateBoardForm>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: CreateBoardForm) => {
        const {name, description} = data
        createBoard({
            name,
            description
        })
        reset();
        onClose();
    };
    const handleClose = () => {
        reset();
        onClose();
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition

        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'absolute' as const,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        Create New Board
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CustomTextField
                            name='name'
                            control={control}
                            label="Board Name"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                        <CustomTextField
                            name='description'
                            control={control}
                            label={'Description'}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            multiline
                            rows={4}
                            sx={{ height: 120 }}
                        />

                        <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                            <Button sx={{ width: 100 }} onClick={handleClose} color="secondary" variant="outlined">
                                Cancel
                            </Button>
                            <Button
                                sx={{width: 100}}
                                type="submit"
                                color="primary"
                                variant="contained"
                                disabled={createBoardsStatus.loading}
                            >
                                {createBoardsStatus.loading ? 
                                    <CircularProgress size={24} color="inherit" /> : 'Create'}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Fade>
        </Modal>
    );
};
