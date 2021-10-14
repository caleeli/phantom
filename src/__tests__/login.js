/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import {render, fireEvent, act} from '@testing-library/svelte'
import Login from '../pages/Login.svelte'
import { push } from 'svelte-spa-router';

window.aws_amplify = {
  Amplify: {
    configure: jest.fn(),
    Auth: {
      signIn: jest.fn((username, password) => {
        if (username === 'user' && password === 'pass') {
          return Promise.resolve({
            username: 'test',
            attributes: {
              email: 'test@test.com',
              phone_number: '+123456789',
            },
          })
        } else {
          return Promise.reject({message: 'Invalid username or password'})
        }
      })
    },
  },
}
jest.mock('svelte-spa-router');

test('Login page', async () => {
  // Mock alert
  window.alert = jest.fn()
  // Mock push

  // Render/mount component
  const { getByText, getByLabelText } = await render(Login, {})
  // Check login title
  expect(getByText('Please login into your account')).toBeInTheDocument()
  // Check Amplify configuration
  expect(window.aws_amplify.Amplify.configure).toBeCalled();
  // Check login form
  const username = getByLabelText('username')
  expect(username).toBeInTheDocument()
  const password = getByLabelText('password')
  expect(password).toBeInTheDocument()
  const login = getByText('Login')
  expect(login).toBeInTheDocument()

  // Check invalid login
  fireEvent.input(username, {target: {value: 'invalid_user'}})
  fireEvent.input(password, {target: {value: 'invalid_pass'}})
  expect(username.value).toBe('invalid_user')
  expect(password.value).toBe('invalid_pass')
  await fireEvent.click(login)
  expect(window.aws_amplify.Amplify.Auth.signIn).toBeCalled()
  expect(window.alert).toBeCalledWith('Invalid username or password')

  // Check invalid login
  fireEvent.input(username, {target: {value: 'user'}})
  fireEvent.input(password, {target: {value: 'pass'}})
  expect(username.value).toBe('user')
  expect(password.value).toBe('pass')
  await fireEvent.click(login)
  expect(window.aws_amplify.Amplify.Auth.signIn).toBeCalled()
  expect(push).toBeCalledWith('#/dashboard')
})
