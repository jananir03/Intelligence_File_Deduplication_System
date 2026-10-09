import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import FolderCopyRoundedIcon from "@mui/icons-material/FolderCopyRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const drawerWidth = 248;

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardRoundedIcon /> },
  { label: "My Files", path: "/files", icon: <FolderCopyRoundedIcon /> },
  {
    label: "Duplicate Groups",
    path: "/duplicate-groups",
    icon: <ContentCopyRoundedIcon />,
  },
  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: <HistoryRoundedIcon />,
  },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    setMenuAnchor(null);
    logout();
    navigate("/login", { replace: true });
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #F0E8F1 0%, #F6EEE9 48%, #ECEAF3 100%)",
      }}
    >
      <Stack direction="row" spacing={1.3} alignItems="center" sx={{ px: 2.4, py: 2.4 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "15px",
            display: "grid",
            placeItems: "center",
            bgcolor: "#756A91",
            color: "#FFFFFF",
            boxShadow: "0 10px 22px rgba(93,80,125,.18)",
          }}
        >
          <AutoAwesomeRoundedIcon />
        </Box>
        <Box>
          <Typography fontWeight={850} color="#38323F" lineHeight={1.1}>
            FileNest
          </Typography>
          <Typography variant="caption" color="#857C87">
            Smart file management
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: "rgba(86,70,88,.08)" }} />

      <Typography
        variant="overline"
        sx={{ px: 2.6, pt: 3, pb: 1, color: "#948A99", letterSpacing: "0.13em", fontWeight: 700 }}
      >
        Workspace
      </Typography>

      <List sx={{ px: 1.25 }}>
        {navItems.map((item, index) => {
          const selected = location.pathname === item.path;
          const accent = ["#76689A", "#8D7A91", "#78938A", "#8B789D"][index];

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                mb: 0.7,
                minHeight: 48,
                borderRadius: 3.2,
                color: selected ? "#544A66" : "#77707B",
                position: "relative",
                overflow: "hidden",
                "& .MuiListItemIcon-root": {
                  minWidth: 42,
                  color: selected ? accent : "#968D9A",
                },
                "&.Mui-selected": {
                  bgcolor: "rgba(255,252,250,.68)",
                  boxShadow: `0 8px 20px ${accent}15`,
                },
                "&.Mui-selected::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 4,
                  borderRadius: 4,
                  bgcolor: accent,
                },
                "&.Mui-selected:hover": {
                  bgcolor: "rgba(255,252,250,.82)",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: selected ? 750 : 560 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: "auto", p: 1.5 }}>
        <Box
          sx={{
            p: 1.8,
            borderRadius: 3.5,
            background: "linear-gradient(135deg, #E7DDEB, #EEE3DE)",
            border: "1px solid rgba(86,70,88,.07)",
            boxShadow: "0 10px 24px rgba(86,70,88,.06)",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255,255,255,.65)",
                color: "#806E91",
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} />
            </Box>
            <Typography variant="caption" color="#776D7B" fontWeight={700}>
              Storage assistant
            </Typography>
          </Stack>
          <Typography variant="body2" color="#5F5866" fontWeight={700} sx={{ mt: 1 }}>
            Find duplicates and save space.
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #F0E8E3 0%, #F7F0ED 38%, #F0EFF5 70%, #E8E7F0 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "fixed", width: 300, height: 300, borderRadius: "50%", bgcolor: "#D9CDD9", opacity: .38, top: -130, right: -100, pointerEvents: "none" }} />
      <Box sx={{ position: "fixed", width: 260, height: 260, borderRadius: "50%", bgcolor: "#DCDCEC", opacity: .42, bottom: -120, left: 260, pointerEvents: "none" }} />

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "#F6EEE9",
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid rgba(86,70,88,.08)",
              bgcolor: "transparent",
              background: "linear-gradient(180deg, #F0E8F1 0%, #F6EEE9 48%, #ECEAF3 100%)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box sx={{ ml: { md: `${drawerWidth}px` }, minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <Box
          component="header"
          sx={{
            height: { xs: 70, md: 78 },
            px: { xs: 2, sm: 3, lg: 4 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "rgba(255,252,250,.48)",
            borderBottom: "1px solid rgba(86,70,88,.07)",
            backdropFilter: "blur(16px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" }, color: "#665D6C" }}
              aria-label="Open navigation"
            >
              <MenuRoundedIcon />
            </IconButton>
            <Box>
              <Typography variant="body2" color="#9A919C">
                Workspace
              </Typography>
              <Typography fontWeight={800} color="#393440">
                {location.pathname === "/dashboard"
                  ? "Dashboard"
                  : location.pathname === "/files"
                    ? "My Files"
                    : location.pathname === "/duplicate-groups"
                      ? "Duplicate Groups"
                      : location.pathname === "/audit-logs"
                        ? "Audit Logs"
                        : "FileNest"}
              </Typography>
            </Box>
          </Stack>

          <Tooltip title="Account menu">
            <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)}>
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "#D9CDDF",
                  color: "#655579",
                  fontWeight: 800,
                  border: "3px solid rgba(255,255,255,.72)",
                  boxShadow: "0 8px 20px rgba(80,65,95,.10)",
                }}
              >
                {(user?.username?.[0] ?? "U").toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 205,
                borderRadius: 3,
                bgcolor: "#FFFCFA",
                boxShadow: "0 18px 40px rgba(70,55,80,.14)",
              },
            }}
          >
            <MenuItem disabled>
              <ListItemIcon><PersonOutlineRoundedIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={user?.username ?? "User"} secondary={user?.email ?? ""} />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Sign out" />
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1600, mx: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
