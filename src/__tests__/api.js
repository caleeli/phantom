/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, act } from '@testing-library/svelte'
import ApiTest from './ApiTest.svelte'
import { _ } from '../helpers'

// Mock Auth.ts class
jest.mock('../Auth', () => {
	return {
		default: jest.fn().mockImplementation(() => {
			return {
				signIn: mockAuthSignIn,
			};
		})
	};
});
jest.mock('../Auth')
jest.mock('svelte-spa-router');

window.fetch = jest.fn(() => {
	return Promise.resolve({
		ok: true,
		json: () => Promise.resolve({
			data: "test",
		})
	})
})

describe('API component', () => {
	test('Check progressbar and value', async () => {
		const { getByText, getByRole } = render(ApiTest)
		await act();
		const progressbar = getByRole('progressbar')
		expect(progressbar).toBeInTheDocument()
		await new Promise(setTimeout)
		const value = getByText('test')
		expect(value).toBeInTheDocument()
	})

	test('Tests arguments', async () => {
		const { getByText, getByRole } = render(ApiTest, {
			params: {
				foo: 'bar',
				arr: ['foo', 'bar'],
			}
		})
		await act();
		const progressbar = getByRole('progressbar')
		expect(progressbar).toBeInTheDocument()
		await new Promise(setTimeout)
		const value = getByText('test')
		expect(value).toBeInTheDocument()
	})
});
