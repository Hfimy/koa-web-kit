import React from 'react';
// import PropTypes from 'prop-types';
// import './Button.scss';

class Button extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);

    this.state = {};
  }

  componentDidMount() {
    console.log('in button');
  }

  handleClick() {
    alert('clicked');
  }

  render() {
    return (
      <button className="btn btn-primary" onClick={this.handleClick}>
        OK
      </button>
    );
  }
}

export default Button;
