import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const PopdownMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === "m") {
      setAnchorEl((prevAnchorEl) =>
        prevAnchorEl ? null : menuButtonRef.current
      );
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <AppBar position="static">
      <Toolbar>
        <Box flexGrow={1} display="flex" justifyContent="center">
          <Typography variant="h4" component="div">
            Flaggquiz.se
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
          ref={menuButtonRef}
          sx={{ ml: "auto" }}
        >
          <MenuIcon />
          <p>Meny</p>
        </IconButton>
        <Menu
          id="menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem component={"a"} href={"/"} onClick={handleMenuClose}>
            <Typography textAlign="center" className="emoji">{"🏁 Flaggquiz"}</Typography>
          </MenuItem>
          <MenuItem component={"a"} href={"/daily"} onClick={handleMenuClose}>
            <Typography textAlign="center" className="emoji">{"📆 Daglig"}</Typography>
          </MenuItem>
          <MenuItem component={"a"} href={"/write"} onClick={handleMenuClose}>
            <Typography textAlign="center" className="emoji">{"✍ Skrivläge"}</Typography>
          </MenuItem>
          <MenuItem component={"a"} href={"/states"} onClick={handleMenuClose}>
            <Typography textAlign="center" className="emoji">{"🇺🇸 Amerikanska stater"}</Typography>
          </MenuItem>
          <MenuItem component={"a"} href={"/continents"} onClick={handleMenuClose}>
            <Typography textAlign="center" className="emoji">{"🌐 Välj världsdel"}</Typography>
          </MenuItem>
          <MenuItem
            component={"a"}
            href={"/countries"}
            onClick={handleMenuClose}
          >
            <Typography textAlign="center" className="emoji">{"🌍 Länder & regioner"}</Typography>
          </MenuItem>
          <MenuItem component={"a"} href={"/about"} onClick={handleMenuClose}>
            <Typography textAlign="center" className="emoji">{"🧾 Om flaggquiz"}</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default PopdownMenu;
