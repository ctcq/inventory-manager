import React from 'react';
import $ from 'jquery';
import csv_location from '../config';

const salutations = ["Marhaba","Grüß Gott","Namaskar","Zdraveite","Hola","Hafa adai","Nǐ hǎo","Dobra većer","God dag","Hoi","hyvää päivää","Bonjour","Dia dhuit","Guten Tag","Yasou","Shalom","Namaste","Jo napot","Góðan dag","Nde-ewo","Selamat siang","Salve","Konnichiwa","Ahn nyong ha se yo","Sveiki","Moïen","Bonġu","Niltze","Namastē","Hallo","Salam","Cześć","Olá","Bună ziua","Zdravstvuyte","Zdravo","Ahoj","Hola","Hujambo","Hallå","Ia orna","Sawasdee","Avuxeni","Merhaba","Zdravstvuyte","Assalamo aleikum","xin chào","Shwmae","Sawubona"];

class Login extends React.Component {
  render() {
    let last_text;
    if (this.props.lastName) {
      last_text = <span> Der letzte Bardienst war <b>{this.props.lastName}</b>.</span>;
    }
      return (
      <div className='Login jumbotron text-center row justify-content-center align-self-center mx-auto rounded'>
        <div>
          <div> <h3>{salutations[Math.floor(Math.random() * salutations.length)]}!</h3></div>
          <div>&nbsp;</div>
          <div>{last_text}</div>
          <div>
            <input
              className='form-control input-group-sm text-center m-2'
              type='text'
              id='login'
              placeholder='Name und Zimmernummer'
              />
          </div>
          <div>&nbsp;</div>
          <div>
            <button
            className='btn btn-primary'
            onClick={this.props.initTable}>
              Bestätigen
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
