'use strict';

const React = require('react');
const classNames = require('classnames');

const UIComponent = require('../UIComponent');

class TextInput extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };
    }

    componentDidMount() {
        this.setState({ value: this.props.value });

        if (this.props.autoSelect) {
            this.refs.input.select();
        }
    }

    componentWillReceiveProps(props) {
        if (typeof props.value !== 'undefined') {
            this.setState({ value: props.value });
        }
    }

    onChange(e) {
        let val = e.target.value;
        
        this.setState({ value: val });

        if (this.props.onChange && !this.props.buffered) {
            this.props.onChange(this.props.name, val);
        }
    }

    onValueChange() {
        let val = this.state.value;

        if (this.props.onChange) {
            this.props.onChange(this.props.name, val);
        }
    }

    onKeyUp(e) {
        if (e.keyCode === 13) {
            this.onValueChange(e);
        }
        else if (e.keyCode === 27) {
            this.setState({ value: this.props.value });

            if (this.props.onCancel) {
                this.props.onCancel();
            }
        }
    }

    render() {
        let props = this.props;

        return (
            <div className={classNames('input', props.className)}>
                <input
                    ref="input"
                    type="text"
                    className={classNames('input-field', props.inputClassName)}
                    style={{width: props.width}}
                    name={props.name}
                    size={props.size}
                    spellCheck={props.spellCheck}
                    autoFocus={props.autoFocus}
                    value={this.state.value}
                    onChange={this.onChange}
                    onBlur={this.onValueChange}
                    onKeyUp={this.onKeyUp}
                    readOnly={props.readOnly || props.disabled}
                />
            </div>
        );
    }
}

TextInput.defaultProps = {
    name: 'text',
    width: 140,
    size: null,
    value: '',
    spellCheck: false,
    autoFocus: false,
    autoSelect: false,
    buffered: false,
    readOnly: false,
    disabled: false
};

module.exports = TextInput;