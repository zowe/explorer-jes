import PropTypes from 'prop-types';
import React from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import store from '../../store/Store';
import * as colors from '../../constants/colors';

const lightTheme = getMuiTheme({
    palette: {
        textColor: colors.textBlack,
        alternateTextColor: colors.textWhite,
        canvasColor: colors.cardSoftWhite,
    },
});

const LightView = props => {
    const { View } = props;
    return (
        <MuiThemeProvider muiTheme={lightTheme}>
            <Provider store={store().getStore()}>
                <View {...props} />
            </Provider>
        </MuiThemeProvider>
    );
};

LightView.propTypes = {
    View: PropTypes.func.isRequired,
};

export default withRouter(LightView);
