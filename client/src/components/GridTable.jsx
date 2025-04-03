import PropTypes from "prop-types";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const GridTable = ({ columns, data, handleDeleteClick, loading }) => {
    if (!data.length) return <h1>No data available</h1>;

    return (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell key={column.key}>
                                <b>{column.label}</b>
                            </TableCell>
                        ))}
                        {handleDeleteClick && <TableCell align="right"><b>Actions</b></TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.id || row.address}>
                            {columns.map((column) => (
                                <TableCell key={column.key}>
                                    {row[column.key]}
                                </TableCell>
                            ))}
                            {handleDeleteClick && (
                                <TableCell align="right">
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteClick(row.address)}
                                        disabled={loading}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
GridTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    handleDeleteClick: PropTypes.func,
    loading: PropTypes.bool,
};

export default GridTable;
