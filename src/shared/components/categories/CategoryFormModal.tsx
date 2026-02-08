import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    useTheme,
    useMediaQuery,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    ShoppingCart,
    Coffee,
    Home,
    Car,
    Utensils,
    Heart,
    Tag,
    Gift,
    Briefcase,
    Zap,
    Plane,
    Activity,
    Dumbbell,
    Book,
    Music,
    Film,
    Gamepad2,
    Camera,
    Palette,
    Languages,
    Dog,
    GraduationCap,
    Pill,
    Stethoscope,
    Baby,
    Users,
    HeartPulse,
    Smartphone,
    Laptop,
    Tv,
    Ghost,
    Rocket,
    Wallet,
    DollarSign,
    PiggyBank,
    Store,
    Trash2,
    Brush,
    Coins,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCreateCategory, useUpdateCategory } from '../../hooks/useCategories';
import { Category } from '../../interfaces/category.interface';
import { colors } from '@/shared/theme';

const iconLookup: Record<string, LucideIcon> = {
    'shopping-cart': ShoppingCart,
    'coffee': Coffee,
    'home': Home,
    'car': Car,
    'utensils': Utensils,
    'heart': Heart,
    'tag': Tag,
    'gift': Gift,
    'briefcase': Briefcase,
    'zap': Zap,
    'plane': Plane,
    'activity': Activity,
    'dumbbell': Dumbbell,
    'book': Book,
    'music': Music,
    'film': Film,
    'gamepad': Gamepad2,
    'camera': Camera,
    'palette': Palette,
    'languages': Languages,
    'dog': Dog,
    'graduation': GraduationCap,
    'pill': Pill,
    'stethoscope': Stethoscope,
    'baby': Baby,
    'users': Users,
    'heart-pulse': HeartPulse,
    'smartphone': Smartphone,
    'laptop': Laptop,
    'tv': Tv,
    'ghost': Ghost,
    'rocket': Rocket,
    'wallet': Wallet,
    'dollar': DollarSign,
    'piggy': PiggyBank,
    'store': Store,
    'trash': Trash2,
    'brush': Brush,
};

const iconOptions = [
    'shopping-cart', 'coffee', 'home', 'car', 'utensils', 'heart', 'tag', 'gift',
    'briefcase', 'zap', 'plane', 'activity', 'dumbbell', 'book', 'music', 'film',
    'gamepad', 'camera', 'palette', 'languages', 'dog', 'graduation', 'pill',
    'stethoscope', 'baby', 'users', 'heart-pulse', 'smartphone', 'laptop', 'tv',
    'ghost', 'rocket', 'wallet', 'dollar', 'piggy', 'store', 'trash', 'brush'
] as const;

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
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
    });

    const selectedColor = watch('color');
    const selectedIcon = watch('icon');
    const selectedType = watch('type');

    const PreviewIcon = iconLookup[selectedIcon || 'tag'] || Tag;

    useEffect(() => {
        if (open) {
            reset({
                name: category?.name || '',
                type: category?.type || defaultType,
                icon: category?.icon || 'tag',
                color: category?.color || colors.accent,
            });
        }
    }, [category, open, reset, defaultType]);

    const onSubmit = async (values: CategoryFormValues) => {
        try {
            if (category) {
                await updateCategory.mutateAsync({ id: category.id, updates: values });
            } else {
                await createCategory.mutateAsync(values);
            }
            onClose();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const isSaving = createCategory.isPending || updateCategory.isPending;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            fullScreen={fullScreen}
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : '20px',
                    border: fullScreen ? 'none' : `1px solid ${colors.border}`,
                    bgcolor: colors.bgSecondary,
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ pt: 1.5 }}>
                    <Stack spacing={3}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: '14px',
                                border: `1px solid ${colors.border}`,
                                bgcolor: 'rgba(255,255,255,0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: '12px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: selectedColor || colors.accent,
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${colors.border}`,
                                }}
                            >
                                <PreviewIcon size={19} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 700, color: colors.textPrimary }}>
                                    {watch('name')?.trim() || 'Nome da categoria'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    {selectedType === 'expense' ? 'Categoria de despesa' : 'Categoria de receita'}
                                </Typography>
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            label="Nome da categoria"
                            placeholder="Ex: Academia, Mercado, Freelancer"
                            {...register('name')}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />

                        <Box>
                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Tipo
                            </Typography>
                            <ToggleButtonGroup
                                value={selectedType}
                                exclusive
                                onChange={(_, value) => value && setValue('type', value, { shouldDirty: true })}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    p: 0.5,
                                    width: '100%',
                                    '& .MuiToggleButton-root': {
                                        flex: 1,
                                        border: 'none',
                                        borderRadius: '9px !important',
                                        py: 1,
                                        fontWeight: 600,
                                        color: colors.textSecondary,
                                        '&.Mui-selected': {
                                            color: colors.textPrimary,
                                            bgcolor: 'rgba(255,255,255,0.09)',
                                        },
                                    },
                                }}
                            >
                                <ToggleButton value="expense">Despesa</ToggleButton>
                                <ToggleButton value="income">Receita</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <FormControl fullWidth>
                            <InputLabel id="category-icon-label">Icone</InputLabel>
                            <Select
                                labelId="category-icon-label"
                                label="Icone"
                                value={selectedIcon || 'tag'}
                                onChange={(e) => setValue('icon', e.target.value, { shouldDirty: true })}
                                renderValue={(value) => {
                                    const Icon = iconLookup[value as string] || Tag;
                                    return (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Icon size={16} />
                                            <Typography sx={{ textTransform: 'capitalize' }}>{String(value).replace('-', ' ')}</Typography>
                                        </Stack>
                                    );
                                }}
                            >
                                {iconOptions.map((iconName) => {
                                    const Icon = iconLookup[iconName] || Tag;
                                    return (
                                        <MenuItem key={iconName} value={iconName}>
                                            <ListItemIcon sx={{ minWidth: 30 }}>
                                                <Icon size={16} />
                                            </ListItemIcon>
                                            <ListItemText primary={iconName.replace('-', ' ')} sx={{ textTransform: 'capitalize' }} />
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>

                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 1.5,
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                <input
                                    type="color"
                                    value={selectedColor || colors.accent}
                                    onChange={(e) => setValue('color', e.target.value, { shouldDirty: true })}
                                    style={{
                                        position: 'absolute',
                                        width: '150%',
                                        height: '150%',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'none',
                                        padding: 0,
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Cor da Categoria</Typography>
                                <Typography variant="caption" color="text.secondary">Identidade visual na listagem</Typography>
                            </Box>
                        </Stack>

                        <input type="hidden" {...register('type')} />
                        <input type="hidden" {...register('icon')} />
                        <input type="hidden" {...register('color')} />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2, gap: 1.25 }}>
                    <Button
                        onClick={onClose}
                        color="inherit"
                        sx={{
                            px: 2.5,
                            color: colors.textSecondary,
                            fontWeight: 600,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Coins size={16} />}
                        sx={{ px: 2.75, fontWeight: 700 }}
                    >
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
