import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import type { EditSettingForm } from '../salarySimulator.helpers';
import { messages } from '@/shared/i18n/messages';
import { Container } from '@/shared/components/layout/Container';

interface SalaryEditSettingDialogProps {
    editForm: EditSettingForm | null;
    isSaving: boolean;
    onClose: () => void;
    onSave: () => void;
    onFieldChange: (field: keyof EditSettingForm, value: string) => void;
}

export function SalaryEditSettingDialog({
    editForm,
    isSaving,
    onClose,
    onSave,
    onFieldChange,
}: SalaryEditSettingDialogProps) {
    const dialogMessages = messages.salarySimulator.editDialog;
    return (
        <Dialog open={Boolean(editForm)} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{dialogMessages.title}</DialogTitle>
            <DialogContent>
                <Container unstyled className="mt-0.5 flex flex-col gap-1.5">
                    <Container unstyled className="grid grid-cols-12 gap-1.5">
                        <Container unstyled className="col-span-12 sm:col-span-6 space-y-0.5">
                            <Label htmlFor="salary-edit-start">{dialogMessages.labels.startDate}</Label>
                            <Input
                                id="salary-edit-start"
                                type="date"
                                value={editForm?.dateStart ?? ''}
                                onChange={(event) => onFieldChange('dateStart', event.target.value)}
                            />
                        </Container>
                        <Container unstyled className="col-span-12 sm:col-span-6 space-y-0.5">
                            <Label htmlFor="salary-edit-end">{dialogMessages.labels.endDate}</Label>
                            <Input
                                id="salary-edit-end"
                                type="date"
                                value={editForm?.dateEnd ?? ''}
                                onChange={(event) => onFieldChange('dateEnd', event.target.value)}
                            />
                        </Container>
                    </Container>

                    <Container unstyled className="space-y-0.5">
                        <Label htmlFor="salary-edit-hourly">{dialogMessages.labels.hourValue}</Label>
                        <Input
                            id="salary-edit-hourly"
                            type="number"
                            value={editForm?.hourlyRate ?? ''}
                            onChange={(event) => onFieldChange('hourlyRate', event.target.value)}
                            min={0}
                            step="0.01"
                        />
                    </Container>

                    <Container unstyled className="space-y-0.5">
                        <Label htmlFor="salary-edit-base">{dialogMessages.labels.proLabore}</Label>
                        <Input
                            id="salary-edit-base"
                            type="number"
                            value={editForm?.baseSalary ?? ''}
                            onChange={(event) => onFieldChange('baseSalary', event.target.value)}
                            min={0}
                            step="0.01"
                        />
                    </Container>

                    <Container unstyled className="grid grid-cols-12 gap-1.5">
                        <Container unstyled className="col-span-12 sm:col-span-6 space-y-0.5">
                            <Label htmlFor="salary-edit-inss">{dialogMessages.labels.inss}</Label>
                            <Input
                                id="salary-edit-inss"
                                type="number"
                                value={editForm?.inssPercentage ?? ''}
                                onChange={(event) => onFieldChange('inssPercentage', event.target.value)}
                                min={0}
                                max={100}
                                step="0.01"
                            />
                        </Container>
                        <Container unstyled className="col-span-12 sm:col-span-6 space-y-0.5">
                            <Label htmlFor="salary-edit-admin">{dialogMessages.labels.adminFee}</Label>
                            <Input
                                id="salary-edit-admin"
                                type="number"
                                value={editForm?.adminFeePercentage ?? ''}
                                onChange={(event) => onFieldChange('adminFeePercentage', event.target.value)}
                                min={0}
                                max={100}
                                step="0.01"
                            />
                        </Container>
                    </Container>
                </Container>
            </DialogContent>
            <DialogActions className="px-3 pb-2">
                <Button onClick={onClose} disabled={isSaving}>
                    {messages.common.actions.cancel}
                </Button>
                <Button variant="contained" onClick={onSave} disabled={isSaving}>
                    {isSaving ? dialogMessages.saving : dialogMessages.save}
                </Button>
            </DialogActions>
        </Dialog>
    );
}


