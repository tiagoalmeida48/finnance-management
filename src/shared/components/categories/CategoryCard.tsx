import { Grid, Card, CardContent, Stack, Box, Typography, IconButton } from '@mui/material';
import { Pencil, Trash2, ShoppingCart, Coffee, Home, Car, Utensils, Heart, Tag, Gift, Briefcase, Zap, Plane, Activity } from 'lucide-react';
import { Category } from '../../interfaces/category.interface';

interface CategoryCardProps {
    category: Category;
    handleEdit: (category: Category) => void;
    handleDelete: (category: Category) => void;
}

const iconMap: Record<string, any> = {
    'shopping-cart': <ShoppingCart size={20} />,
    'coffee': <Coffee size={20} />,
    'home': <Home size={20} />,
    'car': <Car size={20} />,
    'utensils': <Utensils size={20} />,
    'heart': <Heart size={20} />,
    'tag': <Tag size={20} />,
    'gift': <Gift size={20} />,
    'briefcase': <Briefcase size={20} />,
    'zap': <Zap size={20} />,
    'plane': <Plane size={20} />,
    'activity': <Activity size={20} />,
};

export function CategoryCard({ category, handleEdit, handleDelete }: CategoryCardProps) {
    return (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ borderLeft: `4px solid ${category.color || '#D4AF37'}`, position: 'relative' }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, color: category.color || '#D4AF37' }}>
                                {iconMap[category.icon || 'tag'] || iconMap['tag']}
                            </Box>
                            <Typography sx={{ fontWeight: 600 }}>{category.name}</Typography>
                        </Stack>
                        <Stack direction="row">
                            <IconButton size="small" onClick={() => handleEdit(category)} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                                <Pencil size={16} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(category)} color="error" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                                <Trash2 size={16} />
                            </IconButton>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    );
}
