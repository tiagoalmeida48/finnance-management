import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem,
    FormControl, InputLabel, Select, Box, Grid, Typography, IconButton,
} from '@mui/material';
import {
    ShoppingCart, Coffee, Home, Car, Utensils, Heart, Tag, Gift, Briefcase, Zap, Plane, Activity,
    Dumbbell, Book, Music, Film, Gamepad2, Camera, Palette, Languages, Dog, GraduationCap, Pill,
    Stethoscope, Baby, Users, HeartPulse, Smartphone, Laptop, Tv, Ghost, Rocket, Wallet, DollarSign,
    PiggyBank, Store, Trash2, Brush
} from 'lucide-react';
import { useCreateCategory, useUpdateCategory } from '../../hooks/useCategories';
import { Category } from '../../interfaces/category.interface';

const iconOptions = [
    { value: 'shopping-cart', icon: <ShoppingCart size={20} /> },
    { value: 'coffee', icon: <Coffee size={20} /> },
    { value: 'home', icon: <Home size={20} /> },
    { value: 'car', icon: <Car size={20} /> },
    { value: 'utensils', icon: <Utensils size={20} /> },
    { value: 'heart', icon: <Heart size={20} /> },
    { value: 'tag', icon: <Tag size={20} /> },
    { value: 'gift', icon: <Gift size={20} /> },
    { value: 'briefcase', icon: <Briefcase size={20} /> },
    { value: 'zap', icon: <Zap size={20} /> },
    { value: 'plane', icon: <Plane size={20} /> },
    { value: 'activity', icon: <Activity size={20} /> },
    { value: 'dumbbell', icon: <Dumbbell size={20} /> },
    { value: 'book', icon: <Book size={20} /> },
    { value: 'music', icon: <Music size={20} /> },
    { value: 'film', icon: <Film size={20} /> },
    { value: 'gamepad', icon: <Gamepad2 size={20} /> },
    { value: 'camera', icon: <Camera size={20} /> },
    { value: 'palette', icon: <Palette size={20} /> },
    { value: 'languages', icon: <Languages size={20} /> },
    { value: 'dog', icon: <Dog size={20} /> },
    { value: 'graduation', icon: <GraduationCap size={20} /> },
    { value: 'pill', icon: <Pill size={20} /> },
    { value: 'stethoscope', icon: <Stethoscope size={20} /> },
    { value: 'baby', icon: <Baby size={20} /> },
    { value: 'users', icon: <Users size={20} /> },
    { value: 'heart-pulse', icon: <HeartPulse size={20} /> },
    { value: 'smartphone', icon: <Smartphone size={20} /> },
    { value: 'laptop', icon: <Laptop size={20} /> },
    { value: 'tv', icon: <Tv size={20} /> },
    { value: 'ghost', icon: <Ghost size={20} /> },
    { value: 'rocket', icon: <Rocket size={20} /> },
    { value: 'wallet', icon: <Wallet size={20} /> },
    { value: 'dollar', icon: <DollarSign size={20} /> },
    { value: 'piggy', icon: <PiggyBank size={20} /> },
    { value: 'store', icon: <Store size={20} /> },
    { value: 'trash', icon: <Trash2 size={20} /> },
    { value: 'brush', icon: <Brush size={20} /> },
];

const colorOptions = [
    '#D32F2F', '#C2185B', '#7B1FA2', '#512DA8', '#303F9F', '#1976D2', '#0288D1', '#0097A7',
    '#00796B', '#388E3C', '#689F38', '#AFB42B', '#FBC02D', '#FFA000', '#F57C00', '#E64A19',
    '#D4AF37', '#5D4037', '#616161', '#455A64'
];

const categorySchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    type: z.enum(['income', 'expense']),
    icon: z.string(),
    color: z.string(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
    open: boolean;
    onClose: () => void;
    category?: Category;
    defaultType?: 'income' | 'expense';
}

export function CategoryFormModal({ open, onClose, category, defaultType = 'expense' }: CategoryFormModalProps) {
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema) as any,
    });

    const selectedColor = watch('color');
    const selectedIcon = watch('icon');

    useEffect(() => {
        if (open) {
            reset({
                name: category?.name || '',
                type: (category?.type as any) || defaultType,
                icon: category?.icon || 'tag',
                color: category?.color || '#D4AF37',
            });
        }
    }, [category, open, reset, defaultType]);

    const onSubmit = async (values: CategoryFormValues) => {
        try {
            if (category) {
                await updateCategory.mutateAsync({ id: category.id, updates: values });
            } else {
                await createCategory.mutateAsync(values as any);
            }
            onClose();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700 }}>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField fullWidth label="Nome da Categoria" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select label="Tipo" {...register('type')} defaultValue={category?.type || defaultType}>
                                <MenuItem value="expense">Despesa</MenuItem>
                                <MenuItem value="income">Receita</MenuItem>
                            </Select>
                        </FormControl>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Ícone</Typography>
                            <Grid container spacing={1}>
                                {iconOptions.map((opt) => (
                                    <Grid key={opt.value}>
                                        <IconButton onClick={() => setValue('icon', opt.value)} sx={{ border: '1px solid', borderColor: selectedIcon === opt.value ? 'primary.main' : 'rgba(255,255,255,0.1)', bgcolor: selectedIcon === opt.value ? 'rgba(212, 175, 55, 0.1)' : 'transparent', color: selectedIcon === opt.value ? 'primary.main' : 'text.secondary', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                            {opt.icon}
                                        </IconButton>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Cor</Typography>
                            <Grid container spacing={1}>
                                {colorOptions.map((color) => (
                                    <Grid key={color}>
                                        <Box onClick={() => setValue('color', color)} sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: color, cursor: 'pointer', border: '2px solid', borderColor: selectedColor === color ? '#fff' : 'transparent', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button variant="contained" type="submit" disabled={createCategory.isPending || updateCategory.isPending}>Salvar</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
