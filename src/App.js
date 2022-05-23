import './styles.css';
import { useReducer } from 'react'
import DigitButton from './DigitButton';
import OperationButton from './OperationButton';

// Actions types
export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  EVALUATION: 'evaluate',
  DELETE_DIGIT: 'delete-digit',
}

/* SIDENOTE: == vs. ===
  == Double Equals  : Equality, Abstract comparison
    Converts the values to the same type before comparing
    Involves types coercion
  === Triple Equals : Identity, Strict comparison 
    Checks both values and types
*/

// Reducer Function ( state, action )
function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      // If state is already evaluated and curr operand is a result - overwrite and reset
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        }
      }

      // If repeating 0 or . - do nothing
      if (payload.digit === "0" && state.currentOperand === "0") return state
      if (payload.digit === "." && state.currentOperand.includes(".")) return state

      // Default case - add digit to the end of currentOperand
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`, // Backticks allow string interpolation
      }
    case ACTIONS.CHOOSE_OPERATION:
      // If in initial blank state with no operands - do nothing
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }

      // If prev operand exists but no curr operand - replace operation
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }

      // If prev operand is null - shift content to prev operand, clear current operand
      if (state.previousOperand == null) {
        return {
          ...state,
          previousOperand: state.currentOperand,
          operation: payload.operation,
          currentOperand: null,
        }
      }

      // Default case - prev and curr operands exist - evaluate and update prev operand, update operation, clear current operand
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null
      }
    case ACTIONS.CLEAR:
      // Return empty state always
      return {}
    case ACTIONS.EVALUATION:
      // If we don't have all the information we need (state operation, previous, or current) - do nothing
      if (state.operation == null || state.previousOperand == null || state.currentOperand == null) return state

      // Default case - evaluate state and update previous operand, clear state operation and current operand
      return {
        ...state,
        overwrite: true, // Prevent adding digit to append to the results
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }
    case ACTIONS.DELETE_DIGIT:
      // If the curr operand is an eval result - clear the currentOperand (result)
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false, // Reset
          currentOperand: null,
        }
      }

      // If there is nothing to delete - do nothing
      if (state.currentOperand == null) return state

      // If there is only one digit to delete - clear the currentOperand
      if (state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: null
        }
      }

      // Default state - Edit curr operand by removing last digit
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1) // remove last digit 
        /* SIDENOTE slice(inclusiveStart, exclusiveEnd) returns a shallow copy */
      }
    default:
      return state
  }
}

// Comma-separated integers, no fractions
// Separate integer and decimal
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", { maximumFractionDigits: 0 })
function formatOperand(operand) {
  if (operand == null) return

  const [integer, decimal] = operand.split('.')
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function evaluate( /* State */ { currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand) // string -> float
  const curr = parseFloat(currentOperand)

  if (isNaN(prev) || isNaN(curr)) return ""

  let computation = ""
  switch (operation) {
    case "+":
      computation = prev + curr
      break
    case "-":
      computation = prev - curr
      break
    case "*":
      computation = prev * curr
      break
    case "/":
      computation = prev / curr
      break
    default:
      throw new Error('Undefined Operation')
  }

  return computation.toString()
}

function App() {
  const [/* State */ { currentOperand, previousOperand, operation }, dispatch] = useReducer(reducer, {})

  /* SIDENOTE - useReducer hook uses a dispatch method which can be passed down instead of callbacks 
  dispatch = action
  const [state, dispatch] = useReducer(reducer, initialArg, init);
  */
  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">{formatOperand(previousOperand)} {operation}</div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.CLEAR })}> AC </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>
      <OperationButton operation="/" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.EVALUATION })}>=</button>
    </div>
  );
}

export default App;
