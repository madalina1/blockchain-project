import { makeStyles, withStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";

export const useStyles = makeStyles((theme) => ({
  paper: {
    padding: "32px 24px",
    width: "60%",
  },
  title: {
    color: "#212121",
    fontWeight: 700,
    paddingLeft: "12px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
  },
  description: {
    color: "#616161",
  },
  goal: {
    color: "#212121",
    fontWeight: 800,
    paddingLeft: "8px",
  },
  inputFund: {
    marginTop: "24px",
    display: "flex",
    alignItems: "center",
  },
  managerInfo: {},
  dot: {
    height: "8px",
    width: "8px",
    backgroundColor: "#9e9e9e",
    borderRadius: "50%",
    display: "inline-block",
    marginLeft: "12px",
    marginRight: "8px",
  },
  domainName: {
    fontSize: "12px",
    color: "#9e9e9e",
    marginTop: "1px",
  },
  domainTitle: {
    display: "flex",
    alignItems: "center",
    marginTop: "3px",
  },
  managerRating: {
    fontSize: "16px !important",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    margin: " 0 32px 24px 32px",
  },
  dialogTitle: {
    padding: "24px 48px !important",
  },
  dialogActions: {
    padding: "24px 48px !important",
  },
  formMargin: {
    marginBottom: "24px !important",
    width: "40%",
  },
  descriptionStyle: {
    marginBottom: "24px !important",
  },
}));
