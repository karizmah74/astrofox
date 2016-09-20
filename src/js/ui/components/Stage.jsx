'use strict';

const React = require('react');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');

class Stage extends UIComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            width: 854,
            height: 480,
            loading: false
        };
    }

    componentDidMount() {
        this.refs.stage.appendChild(
            Application.stage.renderer.domElement
        );
    }

    onDragOver(e){
        e.stopPropagation();
        e.preventDefault();
    }

    onDrop(e){
        e.stopPropagation();
        e.preventDefault();

        let file = e.dataTransfer.files[0];

        if (file && this.props.onFileDropped) {
            this.props.onFileDropped(file.path);
        }
    }

    showLoading(val) {
        this.setState({ loading: val });
    }

    render() {
        const loading = (this.state.loading) ? <div className="loading" /> : null;

        return (
            <div ref="stage"
                className="stage"
                onDrop={this.onDrop}
                onDragOver={this.onDragOver}>
                <ReactCSSTransitionGroup
                    transitionName="loading"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={500}>
                    {loading}
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}

module.exports = Stage;