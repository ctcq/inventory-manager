import React from 'react';
import $ from 'jquery';

class SumInput extends React.Component {

  render() {
    return (
      <input
          disabled
          className = {'form-control-plaintext text-light'}
          value = {this.props.sum + ' €'}
      />
    );
  }
}

export default SumInput;
