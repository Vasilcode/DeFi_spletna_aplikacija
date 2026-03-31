import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SwapSection } from './SwapSection';

describe('SwapSection', () => {
	it('shows approval action separately from swap action', () => {
		render(
			<SwapSection
				tokenInLabel="Token A"
				tokenOutLabel="Token B"
				inputBalanceFormatted="100"
				swapAllowanceFormatted="0"
				expectedAmountOutFormatted="9.09"
				minAmountOutFormatted="9.04"
				poolPriceDisplay="1 Token A ≈ 1.0000 Token B"
				estimatedGasFormatted="153421"
				poolAddress="0xpool"
				isHighSlippage={false}
				swapDirection="A_TO_B"
				onSwapDirectionChange={vi.fn()}
				swapAmountIn="10"
				onSwapAmountInChange={vi.fn()}
				isAmountInValid={true}
				swapSlippagePercent="0.5"
				onSwapSlippagePercentChange={vi.fn()}
				isSlippageValid={true}
				swapNeedsApproval={true}
				canSwap={false}
				onApproveSwapToken={vi.fn()}
				onSwap={vi.fn()}
				isSwapApprovePending={false}
				isSwapApproveConfirming={false}
				isSwapPending={false}
				isSwapConfirming={false}
			/>,
		);

		expect(screen.getByText('Expected output')).toBeInTheDocument();
		expect(screen.getByText('Minimum received')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /approve swap token/i })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /^swap$/i })).not.toBeInTheDocument();
	});

	it('renders swap button when approval is already satisfied', () => {
		const onSwap = vi.fn();

		render(
			<SwapSection
				tokenInLabel="Token B"
				tokenOutLabel="Token A"
				inputBalanceFormatted="80"
				swapAllowanceFormatted="100"
				expectedAmountOutFormatted="7.77"
				minAmountOutFormatted="7.69"
				poolPriceDisplay="1 Token B ≈ 0.9500 Token A"
				estimatedGasFormatted="150000"
				poolAddress="0xpool"
				isHighSlippage={false}
				swapDirection="B_TO_A"
				onSwapDirectionChange={vi.fn()}
				swapAmountIn="8"
				onSwapAmountInChange={vi.fn()}
				isAmountInValid={true}
				swapSlippagePercent="1"
				onSwapSlippagePercentChange={vi.fn()}
				isSlippageValid={true}
				swapNeedsApproval={false}
				canSwap={true}
				onApproveSwapToken={vi.fn()}
				onSwap={onSwap}
				isSwapApprovePending={false}
				isSwapApproveConfirming={false}
				isSwapPending={false}
				isSwapConfirming={false}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: /^swap$/i }));
		expect(onSwap).toHaveBeenCalledTimes(1);
	});
});
