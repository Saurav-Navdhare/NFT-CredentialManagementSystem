import { Navigate, Outlet } from "react-router-dom";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ userRole, allowedRoles }) => {
    return allowedRoles.includes(userRole) ? <Outlet /> : <Navigate to="/" replace />;
};
ProtectedRoute.propTypes = {
    userRole: PropTypes.string.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProtectedRoute;
