import { Grid, Card, CardContent, Stack, Box, Typography, IconButton, Chip } from '@mui/material';
import {
    Pencil,
    Trash2,
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
    Brush,
} from 'lucide-react';
import { Category } from '../../interfaces/category.interface';
import { colors } from '@/shared/theme';

interface CategoryCardProps {
    category: Category;
    handleEdit: (category: Category) => void;
    handleDelete: (category: Category) => void;
}

const iconMap: Record<string, any> = {
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
    'brush': Brush,
};

export function CategoryCard({ category, handleEdit, handleDelete }: CategoryCardProps) {
    const Icon = iconMap[category.icon || 'tag'] || Tag;

    return (
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card
                sx={{
                    position: 'relative',
                    border: `1px solid ${colors.border}`,
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        bgcolor: category.color || colors.accent,
                    },
                    '&:hover .category-actions': {
                        opacity: 1,
                        transform: 'translateX(0)',
                    },
                }}
            >
                <CardContent sx={{ py: 1.75, px: 2, '&:last-child': { pb: 1.75 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '10px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: category.color || colors.accent,
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${colors.border}`,
                                    flexShrink: 0,
                                }}
                            >
                                <Icon size={18} />
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        color: colors.textPrimary,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {category.name}
                                </Typography>
                                <Chip
                                    size="small"
                                    label={category.type === 'expense' ? 'Despesa' : 'Receita'}
                                    sx={{
                                        mt: 0.5,
                                        height: 20,
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: category.type === 'expense' ? colors.red : colors.green,
                                        bgcolor: category.type === 'expense' ? colors.redBg : colors.greenBg,
                                        border: `1px solid ${category.type === 'expense' ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}`,
                                    }}
                                />
                            </Box>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={0.25}
                            className="category-actions"
                            sx={{
                                opacity: { xs: 1, md: 0.45 },
                                transform: { xs: 'translateX(0)', md: 'translateX(6px)' },
                                transition: 'all 180ms ease',
                                flexShrink: 0,
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={() => handleEdit(category)}
                                sx={{
                                    color: colors.textSecondary,
                                    '&:hover': { color: colors.textPrimary, bgcolor: 'rgba(255,255,255,0.06)' },
                                }}
                            >
                                <Pencil size={15} />
                            </IconButton>

                            <IconButton
                                size="small"
                                onClick={() => handleDelete(category)}
                                sx={{
                                    color: colors.textMuted,
                                    '&:hover': { color: colors.red, bgcolor: colors.redBg },
                                }}
                            >
                                <Trash2 size={15} />
                            </IconButton>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    );
}
