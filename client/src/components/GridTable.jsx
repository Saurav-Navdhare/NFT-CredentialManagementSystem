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
import LaunchIcon from '@mui/icons-material/Launch';

const GridTable = ({ columns, data, handleClick, loading, action = "delete", passRow=false }) => {
    if (!data.length) return <h1>No data available</h1>;

    return (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
                <TableHead>
                    <TableRow key="header">
                        {columns.map((column) => (
                            <TableCell key={column.key}>
                                <b>{column.label}</b>
                            </TableCell>
                        ))}
                        {handleClick && <TableCell align="right" key="action"><b>Action</b></TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.id || row.address || row.request_id}>
                            {columns.map((column) => (
                                <TableCell key={column.key}>
                                    {row[column.key]}
                                </TableCell>
                            ))}
                            {handleClick && (
                                <TableCell align="right" key={`action-${row.id || row.address || row.request_id}`}>
                                    <IconButton
                                        color="error"
                                        // onClick={() => handleClick(action == "delete" ? row.address : row.id)}
                                        onClick={() => handleClick(passRow ? row: action == "delete" ? row.address : row.id)}
                                        disabled={loading}
                                    >
                                        {action === "delete" ? <DeleteIcon /> : <LaunchIcon />}
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
    handleClick: PropTypes.func,
    loading: PropTypes.bool,
    action: PropTypes.string,
    passRow: PropTypes.bool
};

export default GridTable;
