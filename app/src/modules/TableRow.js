import React from 'react';
import $ from 'jquery';

import Input from './Input.js';
import SumInput from './SumInput.js';

class TableRow extends React.Component {

  constructor(props) {
    super(props);
    let sum;
    if (this.props.id != '1') {
      sum = parseFloat(this.props.price) * (this.props.before - this.props.after);
    } else {
      sum = (this.props.before - this.props.after);
    }
    sum = sum === NaN ? '-' : sum;
    this.state = {
      'before' : this.props.before,
      'after' : this.props.after,
      'sum' : sum.toFixed(2)
    };
  }

  formatPrice(price) {
    if (this.props.id != '1'){
      return <span>{parseFloat(price).toFixed(2)}&nbsp;€</span>;
    } else {
      return '';
    }
  }

  updateSum(sum) {
    this.setState({
      'sum' : sum.toFixed(2)
    });
  }

  render() {
    return (
      <tr>
        <td>{this.props.name}</td>
        <td>{this.formatPrice(this.props.price)}</td>
        <td>{this.props.last}</td>
        <td><Input
          id = {this.props.id}
          col = 'before'
          price = {this.props.price}
          value = {this.props.before}
          notify = {(type, message) => {
          this.props.notify(type, message)}
          }
          updateSum = {(sum) => {this.updateSum(sum)}}
        /></td>
        <td><Input
          id = {this.props.id}
          col = 'after'
          price = {this.props.price}
          value = {this.props.after}
          notify = {(type, message) => {
            this.props.notify(type, message)}
          }
          updateSum = {(sum) => {this.updateSum(sum)}}
        /></td>
        <td>
          <SumInput sum={this.state.sum}/>
        </td>
      </tr>
    );
  }
}

export default TableRow;
