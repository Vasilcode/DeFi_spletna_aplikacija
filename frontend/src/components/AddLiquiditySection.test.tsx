import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddLiquiditySection } from './AddLiquiditySection';

describe('AddLiquiditySection', () => {
	it('shows LP preview and separate approval steps', () => {
		render(
			<AddLiquiditySection
				tokenABalanceFormatted="100"
				tokenBBalanceFormatted="200"
				allowanceAFormatted="0"
				allowanceBFormatted="0"
				lpBalanceFormatted="5"
				estimatedLpMintedFormatted="1.5"
				projectedSharePercent="12.50%"
				poolRatioDisplay="1 Token A ≈ 1.0000 Token B"
				errorMessage={undefined}
				liquidityAmountA="10"
				onLiquidityAmountAChange={vi.fn()}
				isAmountAValid={true}
				liquidityAmountB="10"
				onLiquidityAmountBChange={vi.fn()}
				isAmountBValid={true}
				needsApprovalA={true}
				needsApprovalB={true}
				canAddLiquidity={false}
				onApproveA={vi.fn()}
				onApproveB={vi.fn()}
				onAddLiquidity={vi.fn()}
				isApproveAPending={false}
				isApproveAConfirming={false}
				isApproveBPending={false}
				isApproveBConfirming={false}
				isAddLiquidityPending={false}
				isAddLiquidityConfirming={false}
			/>,
		);

		expect(screen.getByText('Estimated LP minted')).toBeInTheDocument();
		expect(screen.getByText('Projected pool share')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /approve token a/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /approve token b/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /add liquidity/i })).toBeDisabled();
	});
});
