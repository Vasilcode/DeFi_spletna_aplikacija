// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LPToken.sol";

contract LiquidityPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    LPToken public immutable lpToken;

    uint256 public reserveA;
    uint256 public reserveB;

    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidityMinted
    );

    event LiquidityRemoved(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidityBurned
    );

    event Swapped(
        address indexed user,
        address indexed tokenIn,
        uint256 amountIn,
        address indexed tokenOut,
        uint256 amountOut
    );

    constructor(address tokenA_, address tokenB_) {
        require(tokenA_ != address(0), "Invalid tokenA");
        require(tokenB_ != address(0), "Invalid tokenB");
        require(tokenA_ != tokenB_, "Tokens must differ");

        tokenA = IERC20(tokenA_);
        tokenB = IERC20(tokenB_);

        lpToken = new LPToken(address(this));
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }

    error InvalidAmount();
    error InsufficientLiquidityMinted();
    error InsufficientLiquidityBurned();
    error InvalidToken();
    error InsufficientOutputAmount();
    error InsufficientAAmount();
    error InsufficientBAmount();
    error UnsupportedTokenBehavior();

    function addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    )
        external
        nonReentrant
        returns (uint256 amountA, uint256 amountB, uint256 liquidityMinted)
    {
        return
            _addLiquidity(
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin
            );
    }

    function addLiquidityExact(
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant returns (uint256 liquidityMinted) {
        (, , liquidityMinted) = _addLiquidity(
            amountA,
            amountB,
            amountA,
            amountB
        );
    }

    function sync() external {
        (uint256 balanceA, uint256 balanceB) = _getBalances();
        _updateReserves(balanceA, balanceB);
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _quote(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256 amountOut) {
        if (amountIn == 0 || reserveIn == 0 || reserveOut == 0) return 0;
        amountOut = (amountIn * reserveOut) / reserveIn;
    }

    function _getBalances() internal view returns (uint256, uint256) {
        return (tokenA.balanceOf(address(this)), tokenB.balanceOf(address(this)));
    }

    function _updateReserves(uint256 balanceA, uint256 balanceB) internal {
        reserveA = balanceA;
        reserveB = balanceB;
    }

    function _safeTransferIn(
        IERC20 token,
        uint256 amount,
        uint256 balanceBefore
    ) internal returns (uint256 actualAmount) {
        token.safeTransferFrom(msg.sender, address(this), amount);

        actualAmount = token.balanceOf(address(this)) - balanceBefore;
        if (actualAmount != amount) revert UnsupportedTokenBehavior();
    }

    function _safeTransferOut(IERC20 token, address to, uint256 amount) internal {
        uint256 recipientBalanceBefore = token.balanceOf(to);

        token.safeTransfer(to, amount);

        uint256 actualAmount = token.balanceOf(to) - recipientBalanceBefore;
        if (actualAmount != amount) revert UnsupportedTokenBehavior();
    }

    function _addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    )
        internal
        returns (uint256 amountA, uint256 amountB, uint256 liquidityMinted)
    {
        if (amountADesired == 0 || amountBDesired == 0) revert InvalidAmount();

        (uint256 balanceABefore, uint256 balanceBBefore) = _getBalances();
        uint256 currentTotalLiquidity = lpToken.totalSupply();

        if (currentTotalLiquidity == 0) {
            if (amountADesired < amountAMin) revert InsufficientAAmount();
            if (amountBDesired < amountBMin) revert InsufficientBAmount();

            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            uint256 amountBOptimal = _quote(
                amountADesired,
                balanceABefore,
                balanceBBefore
            );

            if (amountBOptimal <= amountBDesired) {
                if (amountADesired < amountAMin) revert InsufficientAAmount();
                if (amountBOptimal < amountBMin) revert InsufficientBAmount();

                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint256 amountAOptimal = _quote(
                    amountBDesired,
                    balanceBBefore,
                    balanceABefore
                );

                if (amountAOptimal < amountAMin) revert InsufficientAAmount();
                if (amountBDesired < amountBMin) revert InsufficientBAmount();

                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
        }

        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        (uint256 balanceAAfter, uint256 balanceBAfter) = _getBalances();
        uint256 receivedA = balanceAAfter - balanceABefore;
        uint256 receivedB = balanceBAfter - balanceBBefore;

        if (receivedA != amountA || receivedB != amountB) {
            revert UnsupportedTokenBehavior();
        }

        if (currentTotalLiquidity == 0) {
            liquidityMinted = _sqrt(receivedA * receivedB);
        } else {
            uint256 liquidityA = (receivedA * currentTotalLiquidity) /
                balanceABefore;
            uint256 liquidityB = (receivedB * currentTotalLiquidity) /
                balanceBBefore;
            liquidityMinted = _min(liquidityA, liquidityB);
        }

        if (liquidityMinted == 0) revert InsufficientLiquidityMinted();

        lpToken.mint(msg.sender, liquidityMinted);
        _updateReserves(balanceAAfter, balanceBAfter);

        emit LiquidityAdded(msg.sender, receivedA, receivedB, liquidityMinted);
    }

    function removeLiquidity(
        uint256 liquidity
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        if (liquidity == 0) revert InvalidAmount();

        (uint256 balanceABefore, uint256 balanceBBefore) = _getBalances();
        uint256 totalLiquidity = lpToken.totalSupply();

        amountA = (liquidity * balanceABefore) / totalLiquidity;
        amountB = (liquidity * balanceBBefore) / totalLiquidity;

        if (amountA == 0 || amountB == 0) revert InsufficientLiquidityBurned();

        lpToken.burn(msg.sender, liquidity);
        _safeTransferOut(tokenA, msg.sender, amountA);
        _safeTransferOut(tokenB, msg.sender, amountB);

        (uint256 balanceAAfter, uint256 balanceBAfter) = _getBalances();
        _updateReserves(balanceAAfter, balanceBAfter);

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidity);
    }

    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert InvalidAmount();

        bool isTokenAIn = tokenIn == address(tokenA);
        if (!isTokenAIn && tokenIn != address(tokenB)) revert InvalidToken();

        IERC20 inputToken = isTokenAIn ? tokenA : tokenB;
        IERC20 outputToken = isTokenAIn ? tokenB : tokenA;

        (uint256 balanceABefore, uint256 balanceBBefore) = _getBalances();
        uint256 reserveIn = isTokenAIn ? balanceABefore : balanceBBefore;
        uint256 reserveOut = isTokenAIn ? balanceBBefore : balanceABefore;

        uint256 actualAmountIn = _safeTransferIn(inputToken, amountIn, reserveIn);

        amountOut = _getAmountOut(actualAmountIn, reserveIn, reserveOut);

        if (amountOut < minAmountOut || amountOut == 0) {
            revert InsufficientOutputAmount();
        }

        _safeTransferOut(outputToken, msg.sender, amountOut);

        (uint256 balanceAAfter, uint256 balanceBAfter) = _getBalances();
        _updateReserves(balanceAAfter, balanceBAfter);

        emit Swapped(
            msg.sender,
            address(inputToken),
            actualAmountIn,
            address(outputToken),
            amountOut
        );
    }

    function _getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256) {
        if (reserveIn == 0 || reserveOut == 0) return 0;
        return (amountIn * reserveOut) / (reserveIn + amountIn);
    }
}
