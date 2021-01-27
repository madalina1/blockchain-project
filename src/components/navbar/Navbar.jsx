import React from "react";
import logo from "../../logo.png";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStyles } from "./navbar.style";
import Avatar from "@material-ui/core/Avatar";
import { getNameInitials } from "./utils";

const Roles = {
  manager: "Manager",
  freelancer: "Freelancer",
  evaluator: "Evaluator",
  funder: "Funder",
};

const Navbar = (props) => {
  const classes = useStyles();
  const { role, userName, account } = props;

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <img
            src={logo}
            height="32px"
            width="32px"
            style={{ marginRight: "12px" }}
            alt="Logo"
          />
          <Typography variant="h6" className={classes.title}>
            .marketplace
          </Typography>
          
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar className={classes.accountIcon}>
              {userName && getNameInitials(userName)}
            </Avatar>
            <span className={classes.userRoleContainer}>
              <Typography variant="subtitle1" className={classes.userName}>
                {userName}
              </Typography>
              <Typography variant="subtitle1" className={classes.userRole}>
                {Roles[role]}
              </Typography>
            </span>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Navbar;
