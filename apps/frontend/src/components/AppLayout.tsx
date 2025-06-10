import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    IconButton,
    Stack,
    FormControlLabel,
    Switch,
    Tabs,
    Tab
} from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from "@utils/useAuth";
import { useCustomTheme } from "@utils/useCustomTheme";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const tabRoutes = [
    { label: "Workspace", path: "/boards" },
    { label: "Settings", path: "/settings" },
    { label: "Profile", path: "/profile" },
];

export default function AppLayout() {
    const { user } = useAuth();
    const { mode, toggleTheme } = useCustomTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const currentTab = tabRoutes.findIndex(tab => location.pathname.startsWith(tab.path));

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", width: '100vw' }}>
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <Stack direction='row' sx={{ width: '100%' }} justifyContent="space-between">
                        <Stack direction='row' alignItems='center' gap={2}>
                            <Typography variant="h6">Mini Trello</Typography>
                            <Tabs
                                value={currentTab === -1 ? false : currentTab}
                                onChange={(_, newValue) => navigate(tabRoutes[newValue].path)}
                                textColor="primary"
                                indicatorColor="primary"
                            >
                                {tabRoutes.map((tab) => (
                                    <Tab key={tab.path} label={tab.label} />
                                ))}
                            </Tabs>
                        </Stack>

                        <Stack direction='row' alignItems='center' gap={2}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={mode === "dark"}
                                        onChange={toggleTheme}
                                        name="themeToggle"
                                    />
                                }
                                label={mode === "light" ? "🌙" : "☀️"}
                            />
                            <IconButton edge="end" color="inherit">
                                <NotificationsIcon />
                            </IconButton>
                            <Typography variant="body1">
                                Hello, {user?.name}
                            </Typography>
                        </Stack>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
                <Outlet />
            </Box>
        </Box>
    );
}
