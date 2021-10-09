/**
 * @jest-environment jsdom
 */
// NOTE: jest-dom adds handy assertions to Jest and it is recommended, but not required.
import '@testing-library/jest-dom'

import {render, fireEvent} from '@testing-library/svelte'

import Alert from '../components/Alert.svelte'

test('shows proper heading when rendered', () => {
  const {getByText} = render(Alert, {})

  //expect(getByText('Hello World!')).toBeInTheDocument()
})

// Note: This is as an async test as we are using `fireEvent`
test('changes button text on click', async () => {
  const {getByText} = render(Alert, {})
  const button = getByText('Close')

  // Using await when firing events is unique to the svelte testing library because
  // we have to wait for the next `tick` so that Svelte flushes all pending state changes.
  // await fireEvent.click(button)

  // expect(button).toHaveTextContent('Button Clicked')
})
