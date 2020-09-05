import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import * as actions from "../../store/actions/index";
import { updateObject, checkValidity } from "../../shared/utility";
import Input from "../UI/Input/Input";
import Spinner from "../UI/Spinner/Spinner";
import Button from "../UI/Button/Button";
import classes from "./Auth.module.css";

const Auth = (props) => {
  const [authForm, setAuthForm] = useState({
    email: {
      login: true,
      elementType: "input",
      elementConfig: {
        type: "email",
        placeholder: "Mail Address",
      },
      value: "",
      validation: {
        required: true,
        isEmail: true,
      },
      valid: false,
      touched: false,
    },
    password: {
      login: true,
      elementType: "input",
      elementConfig: {
        type: "password",
        placeholder: "password",
      },
      value: "",
      validation: {
        required: true,
        minLength: 6,
      },
      valid: false,
      touched: false,
    },
    username: {
      login: false,
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Username",
      },
    },
  });

  const { authRedirectPath } = props;

  const inputChangedHandler = (event, controlName) => {
    const updatedControls = updateObject(authForm, {
      [controlName]: updateObject(authForm[controlName], {
        value: event.target.value,
        valid: checkValidity(
          event.target.value,
          authForm[controlName].validation
        ),
        touched: true,
      }),
    });
    setAuthForm(updatedControls);
  };

  const submitHandler = (event) => {
    console.log("submitted");
    event.preventDefault();
    props.onAuth(authForm.email.value, authForm.password.value, props.isSignUp, authForm.username.value);
  };

  const signupArray = [];
  for (let key in authForm) {
    signupArray.push({
      id: key,
      config: authForm[key],
    });
  }

  const loginArray = [];
  for (let key in authForm) {
    if(authForm[key].login) {
    loginArray.push({
      id: key,
      config: authForm[key],
    });
    }
  }

  let formElementArray = signupArray;
  if (!props.isSignUp) {
    formElementArray = loginArray;
  }

  let form = formElementArray.map((formElement) => (
    <Input
      key={formElement.id}
      elementType={formElement.config.elementType}
      elementConfig={formElement.config.elementConfig}
      value={formElement.config.value}
      invalid={!formElement.config.valid}
      shouldValidate={formElement.config.validation}
      touched={formElement.config.touched}
      changed={(event) => inputChangedHandler(event, formElement.id)}
    />
  ));
  if (props.loading) {
    form = <Spinner />;
  }

  let errorMessage = null;

  if (props.error) {
    errorMessage = <p>{props.error.message}</p>;
  }

  let authRedirect = null;
  if (props.isAuthenticated) {
    authRedirect = <Redirect to={authRedirectPath} />;
  }

  return (
    <div className={classes.Auth}>
      {authRedirect}
      {errorMessage}
      <form onSubmit={submitHandler}>{form}</form>
      <Button btnType="Success" clicked={submitHandler}>
        {props.isSignUp ? "Sign Up" : "Log In"}
      </Button>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    isAuthenticated: state.auth.token !== null,
    authRedirectPath: state.auth.authRedirectPath,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAuth: (email, password, username, isSignup) =>
      dispatch(actions.auth(email, password, username, isSignup)),
    onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectedPath("/")),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);