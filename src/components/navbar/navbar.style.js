import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "#212121",
    fontWeight: 700,
  },
  appBar: {
    backgroundColor: "#ffffff",
    boxShadow:
      "0px 0px 0px 0px rgba(0,0,0,0.2), 0px 0px 5px 0px rgba(0,0,0,0.14), 0px 2px 12px 2px rgba(0,0,0,0.12)",
    padding: "0 12px",
  },
  userRole: {
    color: '#616161',
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    lineHeight: '14px'
  },
  userName: {
    color: '#212121',
    fontWeight: 500,
    lineHeight: '22px'
  },
  userRoleContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  accountIcon: {
    marginRight: "12px", 
    backgroundColor: '#0277bd !important',
  }
}));
