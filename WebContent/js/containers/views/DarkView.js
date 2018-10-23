import PropTypes from 'prop-types';
import React from 'react';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import store from '../../store/Store';
import * as colors from '../../constants/colors';

const darkTheme = getMuiTheme({
    palette: {
        textColor: colors.textWhite,
        alternateTextColor: colors.textWhite,
        canvasColor: colors.cardSoftGrey,
        disabledColor: colors.textWhite,
    },
});

let cssLoaded = false;

const DarkView = props => {
    const { View } = props;
    if (cssLoaded === false) {
        cssLoaded = true;
        import('../../../css/darkStyle.css');
    }
    return (
        <MuiThemeProvider muiTheme={darkTheme}>
            <Provider store={store().getStore()}>
                <View {...props} />
            </Provider>
        </MuiThemeProvider>
    );
};
DarkView.propTypes = {
    View: PropTypes.func.isRequired,
};

export default withRouter(DarkView);
