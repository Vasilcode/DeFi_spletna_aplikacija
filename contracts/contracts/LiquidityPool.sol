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
    error InvalidLiquidityRatio();
    error InsufficientLiquidityMinted();
    error InsufficientLiquidityBurned();
    error InvalidToken();
    error InsufficientOutputAmount();

    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant returns (uint256 liquidityMinted) {
        if (amountA == 0 || amountB == 0) revert InvalidAmount();

        uint256 currentTotalLiquidity = lpToken.totalSupply();

        if (reserveA == 0 && reserveB == 0) {
            liquidityMinted = _sqrt(amountA * amountB);
        } else {
            if (amountA * reserveB != amountB * reserveA) {
                revert InvalidLiquidityRatio();
            }

            uint256 liquidityA = (amountA * currentTotalLiquidity) / reserveA;
            uint256 liquidityB = (amountB * currentTotalLiquidity) / reserveB;
            liquidityMinted = _min(liquidityA, liquidityB);
        }

        if (liquidityMinted == 0) revert InsufficientLiquidityMinted();

        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;

        lpToken.mint(msg.sender, liquidityMinted);

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidityMinted);
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

    function removeLiquidity(
        uint256 liquidity
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        if (liquidity == 0) revert InvalidAmount();

        uint256 totalLiquidity = lpToken.totalSupply();

        amountA = (liquidity * reserveA) / totalLiquidity;
        amountB = (liquidity * reserveB) / totalLiquidity;

        if (amountA == 0 || amountB == 0) revert InsufficientLiquidityBurned();

        lpToken.burn(msg.sender, liquidity);

        reserveA -= amountA;
        reserveB -= amountB;

        tokenA.safeTransfer(msg.sender, amountA);
        tokenB.safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidity);
    }

    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert InvalidAmount();

        bool isTokenAIn = tokenIn == address(tokenA);
        bool isTokenBIn = tokenIn == address(tokenB);

        if (!isTokenAIn && !isTokenBIn) revert InvalidToken();

        IERC20 inputToken = isTokenAIn ? tokenA : tokenB;
        IERC20 outputToken = isTokenAIn ? tokenB : tokenA;

        uint256 reserveIn = isTokenAIn ? reserveA : reserveB;
        uint256 reserveOut = isTokenAIn ? reserveB : reserveA;

        amountOut = _getAmountOut(amountIn, reserveIn, reserveOut);

        if (amountOut < minAmountOut || amountOut == 0) {
            revert InsufficientOutputAmount();
        }

        inputToken.safeTransferFrom(msg.sender, address(this), amountIn);

        if (isTokenAIn) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        outputToken.safeTransfer(msg.sender, amountOut);

        emit Swapped(
            msg.sender,
            address(inputToken),
            amountIn,
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
