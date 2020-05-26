import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

const REQUEST_RESET = gql`
  mutation REQUEST_RESET(
    $email: String!
  ) {
    requestReset(email: $email) {
     message
    }
  }
`;
class RequestReset extends Component {
  state = {
    email: "",
  }
  saveToState = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <Mutation
        mutation={REQUEST_RESET} 
        variables={this.state}
        >
        {(reset, { error, loading,called }) => {
          return (
            <Form
              method="post"
              data-set="form"
              onSubmit={async (e) => {
                e.preventDefault();
                await reset();
                this.setState({
                  email: "",
                });
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Password reset</h2>
                <Error error={error} />
                {!error && !loading && called &&<p> SUCCESS!! Reset link is end to your Email address</p>}
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="email"
                    value={this.state.email}
                    onChange={this.saveToState}
                  />
                </label>
                
                <button type="submit">Submit !!</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default RequestReset
export { REQUEST_RESET }