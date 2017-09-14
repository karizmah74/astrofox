import React from 'react';

import UIComponent from 'components/UIComponent';
import MenuBarItem from 'components/nav/MenuBarItem';

export default class MenuBar extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            activeIndex: -1,
            items: props.items
        };
    }

    onClick(index) {
        this.setActiveIndex((this.state.activeIndex === index) ? -1 : index);
    }

    onMouseOver(index) {
        if (this.state.activeIndex > -1) {
            this.setActiveIndex(index);
        }
    }

    onMenuItemClick(action, checked) {
        this.setActiveIndex(-1);

        if (this.props.onMenuAction) {
            this.props.onMenuAction(action, checked);

            if (typeof checked !== 'undefined') {
                this.setCheckState(action);
            }
        }
    }

    setActiveIndex(index) {
        if (this.state.activeIndex !== index) {
            this.setState({activeIndex: index});
        }
    }

    setCheckState(action) {
        let items = this.state.items;

        items.forEach(barItem => {
            if (barItem.submenu) {
                barItem.submenu.forEach(menuItem => {
                    if (action === menuItem.action) {
                        menuItem.checked = !menuItem.checked;
                        this.setState(items);
                    }
                });
            }
        });
    }

    render() {
        let items = this.state.items.map((item, index) => {
            if (item.hidden !== true) {
                return (
                    <MenuBarItem
                        key={index}
                        label={item.label}
                        items={item.submenu}
                        active={this.state.activeIndex === index}
                        onClick={this.onClick.bind(this, index)}
                        onMouseOver={this.onMouseOver.bind(this, index)}
                        onMenuItemClick={this.onMenuItemClick}
                    />
                );
            }
        });

        return (
            <div className="menubar">
                {items}
            </div>
        );
    }
}

MenuBar.defaultProps = {
    items: {}
};