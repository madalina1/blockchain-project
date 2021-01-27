import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  root: {
    padding: "48px 36px",
  },
  createProduct: {
    display: "flex",
    justifyContent: "center",
    marginBottom: '48px',
  },
  createProductContainer: {
    width: '62%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  createProductContainerFunder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '48px',
  },
  title: {
    fontWeight: 700
  },
  funderProductsTitle: {
    fontWeight: 700,
    display: 'flex',
    width: '62%',
  }
}));
