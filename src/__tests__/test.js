/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import {render, fireEvent, act} from '@testing-library/svelte'
import Alert from '../components/Alert.svelte'

test('shows alert message', async () => {
  const {getByText} = render(Alert, {})
  window.alert('Hello World!');
  await act();
  expect(getByText('Hello World!')).toBeInTheDocument()
})

test('close alert message', async () => {
  const {getByText} = render(Alert, {})
  const button = getByText('Close')

  expect(button).toBeInTheDocument()
  await fireEvent.click(button)
})
