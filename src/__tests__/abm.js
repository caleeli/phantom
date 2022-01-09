/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, act, fireEvent } from '@testing-library/svelte'
import ABM from '../components/ABM.svelte'

describe('ABM component', () => {
	const config = {
		create: {
			column1: ":column1",
			column2: ":column2",
			column3: ":column3",
		},
		update: {
			column1: ":column1",
			column2: ":column2",
			column3: ":column3",
		},
		ui: {
			column1: {
			},
			column2: {
				hidden: true,
				type: "email",
			},
			column3: {
				hidden: false,
			},
			_actions: {
				value: "attributes.id",
				actions: [
					"edit",
					"view",
					"print"
				],
				control: "actions"
			}
		}
	}

	// before all
	beforeAll(() => {
		window.fetch = jest.fn((url) => {
			const parsed = new URL(url)
			const filter = parsed.searchParams.get("filter[]")
			console.log(filter)
			if (filter === 'findText("no result")') {
				console.log("return empty")
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({
						data: [],
					})
				})
			}
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve({
					data: [{
						id: 1,
						attributes: {
							id: 1,
							column1: ":value1",
							column2: ":value2",
							column3: ":value3",
						}
					}],
				})
			})
		})
	})

	test('No config defined', async () => {
		render(ABM, {
			props: {
			}
		})
	})

	test('No config.ui defined', async () => {
		try {
			render(ABM, {
				props: {
					config: {
					}
				}
			})
		} catch (e) {
			expect(e).toBe('No config.ui defined')
		}
	})

	test('Test ABM Hidden columns', async () => {
		const { getByRole, getByText } = render(ABM, {
			props: {
				config
			}
		})
		await act()
		const progressbar = getByRole('progressbar')
		expect(progressbar).toBeInTheDocument()
		await new Promise(setTimeout)
		const column1 = getByText('column1')
		const column3 = getByText('column3')
		const table = getByRole('table')
		expect(column1).toBeInTheDocument()
		expect(column3).toBeInTheDocument()
		expect(table).toBeInTheDocument()
		expect(table).not.toContainHTML('column2')
	})

	test('Test ABM create record', async () => {
		const { getByRole, getByTestId } = render(ABM, {
			props: {
				config
			}
		})
		await act()
		const progressbar = getByRole('progressbar')
		expect(progressbar).toBeInTheDocument()
		await new Promise(setTimeout)
		const create = getByTestId('_model')
		create.click()
		await act()
		const submitButton = getByTestId('create-submit')
		const cancelButton = getByTestId('create-cancel')
		expect(submitButton).toBeInTheDocument()
		expect(cancelButton).toBeInTheDocument()
		cancelButton.click()
		create.click()
		await act()
		const createColumn1 = getByTestId('create-column1')
		const createColumn2 = getByTestId('create-column2')
		const createColumn3 = getByTestId('create-column3')
		expect(createColumn1).toBeInTheDocument()
		expect(createColumn2).toBeInTheDocument()
		expect(createColumn3).toBeInTheDocument()
		expect(createColumn1).toHaveAttribute('type', 'text')
		expect(createColumn2).toHaveAttribute('type', 'email')
		expect(createColumn3).toHaveAttribute('type', 'text')
		fireEvent.input(createColumn1, { target: { value: 'test1' } })
		fireEvent.input(createColumn2, { target: { value: 'test2@example.com' } })
		fireEvent.input(createColumn3, { target: { value: 'test3' } })
		expect(createColumn1).toHaveValue('test1')
		expect(createColumn2).toHaveValue('test2@example.com')
		expect(createColumn3).toHaveValue('test3')
		submitButton.click()
		await act()
		await act()
		expect(submitButton).not.toBeVisible()
	})

	test('Test ABM edit record', async () => {
		const { getByRole, getByTestId } = render(ABM, {
			props: {
				config
			}
		})
		await act()
		const progressbar = getByRole('progressbar')
		expect(progressbar).toBeInTheDocument()
		await new Promise(setTimeout)
		const edit = getByTestId('action-edit')
		edit.click()
		await act()
		const submitButton = getByTestId('edit-submit')
		const cancelButton = getByTestId('edit-cancel')
		expect(submitButton).toBeInTheDocument()
		expect(cancelButton).toBeInTheDocument()
		cancelButton.click()
		edit.click()
		await act()
		const createColumn1 = getByTestId('edit-column1')
		const createColumn2 = getByTestId('edit-column2')
		const createColumn3 = getByTestId('edit-column3')
		expect(createColumn1).toBeInTheDocument()
		expect(createColumn2).toBeInTheDocument()
		expect(createColumn3).toBeInTheDocument()
		expect(createColumn1).toHaveAttribute('type', 'text')
		expect(createColumn2).toHaveAttribute('type', 'email')
		expect(createColumn3).toHaveAttribute('type', 'text')
		fireEvent.input(createColumn1, { target: { value: 'test1' } })
		fireEvent.input(createColumn2, { target: { value: 'test2@example.com' } })
		fireEvent.input(createColumn3, { target: { value: 'test3' } })
		expect(createColumn1).toHaveValue('test1')
		expect(createColumn2).toHaveValue('test2@example.com')
		expect(createColumn3).toHaveValue('test3')
		submitButton.click()
		await act()
		await act()
		expect(submitButton).not.toBeVisible()
	})

	test('Test ABM view record', async () => {
		const { getByRole, getByTestId } = render(ABM, {
			props: {
				config
			}
		})
		await act()
		const progressbar = getByRole('progressbar')
		expect(progressbar).toBeInTheDocument()
		await new Promise(setTimeout)
		const view = getByTestId('action-view')
		view.click()
		await act()
		const closeButton = getByTestId('view-close')
		expect(closeButton).toBeInTheDocument()
		const createColumn1 = getByTestId('view-column1')
		const createColumn2 = getByTestId('view-column2')
		const createColumn3 = getByTestId('view-column3')
		expect(createColumn1).toBeInTheDocument()
		expect(createColumn2).toBeInTheDocument()
		expect(createColumn3).toBeInTheDocument()
		closeButton.click()
		await act()
		await act()
		expect(closeButton).not.toBeVisible()
	})

	test('Test ABM print record', async () => {
		window.print = jest.fn()
		const { getByRole, getByTestId } = render(ABM, {
			props: {
				config
			}
		})
		await act()
		const progressbar = getByRole('progressbar')
		expect(progressbar).toBeInTheDocument()
		await new Promise(setTimeout)
		const print = getByTestId('action-print')
		print.click()
		await act()
		const createColumn1 = getByTestId('print-column1')
		const createColumn2 = getByTestId('print-column2')
		const createColumn3 = getByTestId('print-column3')
		expect(createColumn1).toBeInTheDocument()
		expect(createColumn2).toBeInTheDocument()
		expect(createColumn3).toBeInTheDocument()
		expect(window.print).toBeCalled()
	})

	test('Test ABM search', async () => {
		const { getByRole, getByTestId } = render(ABM, {
			props: {
				config
			}
		})
		await act()
		const progressbar = getByRole('progressbar')
		expect(progressbar).toBeInTheDocument()
		await new Promise(setTimeout)
		const filter = getByTestId('filter')
		let filterSubmit = getByTestId('filter-submit')

		// Find text "no result"
		fireEvent.input(filter, { target: { value: 'no result' } })
		fireEvent.click(filterSubmit)
		await act()
		await new Promise(setTimeout)
		const table = getByRole('table')
		expect(table).not.toContainHTML('value1')

		// Find text "value1"
		fireEvent.input(filter, { target: { value: 'value1' } })
		expect(filter).toHaveValue('value1')
		fireEvent.click(filterSubmit)
		await act()
		await new Promise(setTimeout)
		// expect(table).toContainHTML('value1')
	})
});
