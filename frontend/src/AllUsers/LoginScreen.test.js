// import { shallow } from 'enzyme';
import { createShallow } from '@material-ui/core/test-utils';
// import { render, screen } from '@testing-library/react';
import React from 'react';
// import renderer from 'react-test-renderer';
import LoginForm from './LoginScreen.js';
import TextField from '@material-ui/core/TextField';

describe('Test Login', () => {
  let shallow;
  const fieldProps = {
    onChange: jest.fn(),
    onClick: jest.fn()
  };

  beforeAll(() => {
    shallow = createShallow();
  });
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<LoginForm {...fieldProps} />);
  });

  it('check there are 2 TextFields contained in this component', () => {
    expect(wrapper.find(TextField)).toHaveLength(2);
  });

  it('check there are 1 Button contained in this component', () => {
    expect(wrapper.find('#tenantLoginButton')).toHaveLength(1);
  });

  it('check there are 1 Button contained in this component', () => {
    expect(wrapper.find('#ownerLoginButton')).toHaveLength(1);
  });

  it('check there are 1 Button contained in this component', () => {
    expect(wrapper.find('#managerLoginButton')).toHaveLength(1);
  });

  it('Onchange functions are well defined in all TextFields', () => {
    expect(wrapper.find(TextField).at(0).props().onChange).toBeDefined();
    expect(wrapper.find(TextField).at(1).props().onChange).toBeDefined();
  });

  it('email changing test', () => {
    const mockEvent = { target: { value: '123@email.com' } }
    wrapper.find(TextField).find('#email').simulate('change', mockEvent);
    expect(wrapper.find(TextField).find('#email').props().value).toEqual('123@email.com');
  });

  it('password changing test', () => {
    const mockEvent = { target: { value: '123456' } }
    wrapper.find(TextField).find('#password').simulate('change', mockEvent);
    expect(wrapper.find(TextField).find('#password').props().value).toEqual('123456');
  });
})
