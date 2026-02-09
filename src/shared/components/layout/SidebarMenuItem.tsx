import { ListItem, Tooltip, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { colors } from '@/shared/theme';

interface SidebarMenuItemProps {
    label: string;
    icon: LucideIcon;
    path: string;
    open: boolean;
    isActive: boolean;
    itemHeight: number;
    onClick: (path: string) => void;
}

export function SidebarMenuItem({ label, icon: Icon, path, open, isActive, itemHeight, onClick }: SidebarMenuItemProps) {
    return (
        <ListItem disablePadding>
            <Tooltip title={!open ? label : ''} placement="right">
                <ListItemButton
                    onClick={() => onClick(path)}
                    sx={{
                        width: '100%',
                        height: itemHeight,
                        minHeight: itemHeight,
                        borderRadius: '12px',
                        px: 1.5,
                        py: 0,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        display: 'flex',
                        position: 'relative',
                        color: isActive ? colors.accent : colors.textMuted,
                        bgcolor: isActive ? colors.accentGlow : 'transparent',
                        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': isActive
                            ? {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '3px',
                                height: '20px',
                                borderRadius: '0 4px 4px 0',
                                bgcolor: colors.accent,
                            }
                            : {},
                        '&:hover': {
                            bgcolor: isActive ? colors.accentGlow : 'rgba(255, 255, 255, 0.04)',
                            color: isActive ? colors.accent : colors.textSecondary,
                        },
                    }}
                >
                    <ListItemIcon
                        sx={{
                            color: 'inherit',
                            minWidth: 36,
                            lineHeight: 0,
                            justifyContent: 'center',
                            '& svg': {
                                width: 20,
                                height: 20,
                                display: 'block'
                            }
                        }}
                    >
                        <Icon size={20} />
                    </ListItemIcon>
                    <ListItemText
                        primary={label}
                        sx={{
                            opacity: open ? 1 : 0,
                            transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                            '& .MuiTypography-root': {
                                fontSize: '13.5px',
                                fontWeight: isActive ? 600 : 500,
                                whiteSpace: 'nowrap',
                            }
                        }}
                    />
                </ListItemButton>
            </Tooltip>
        </ListItem>
    );
}
