import {
    TextField,
    type TextFieldProps,
} from "@mui/material";
import { Controller, type Control } from "react-hook-form";
type Props = {
    control: Control<any>;
    name: string
    label?: string
} & Omit<TextFieldProps, "name" | "control" | "defaultValue" | "render" | "value">;

export default function CustomTextField(props: Props) {
    const {
        name,
        label,
        control,
        ...rest
    } = props;

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <TextField
                    {...field}
                    fullWidth
                    label={label || name || ''}
                    sx={{ height: 62 }}
                    margin="normal"
                    {...rest}
                />
            )}
        />
    );
}
