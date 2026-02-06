
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const buttonClasses = "text-2xl h-16 w-16 rounded-full transition-all duration-200";

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleDigitClick = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleOperatorClick = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (currentValue === null) {
      setCurrentValue(inputValue);
    } else if (operator) {
      const result = calculate(currentValue, inputValue, operator);
      setCurrentValue(result);
      setDisplay(String(result));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (firstOperand: number, secondOperand: number, op: string) => {
    switch (op) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '*':
        return firstOperand * secondOperand;
      case '/':
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  };

  const handleEqualsClick = () => {
    if (!operator || currentValue === null) return;
    const inputValue = parseFloat(display);
    const result = calculate(currentValue, inputValue, operator);
    setDisplay(String(result));
    setCurrentValue(result);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handleClearClick = () => {
    setDisplay('0');
    setCurrentValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleDecimalClick = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleSignChangeClick = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const handlePercentClick = () => {
    setDisplay(String(parseFloat(display) / 100));
  };
  
  const buttons = [
    { label: currentValue !== null ? 'C' : 'AC', handler: handleClearClick, variant: 'secondary' },
    { label: '+/-', handler: handleSignChangeClick, variant: 'secondary' },
    { label: '%', handler: handlePercentClick, variant: 'secondary' },
    { label: '÷', handler: () => handleOperatorClick('/'), variant: 'default', className: 'bg-accent text-accent-foreground hover:bg-accent/80' },

    { label: '7', handler: () => handleDigitClick('7'), variant: 'outline' },
    { label: '8', handler: () => handleDigitClick('8'), variant: 'outline' },
    { label: '9', handler: () => handleDigitClick('9'), variant: 'outline' },
    { label: '×', handler: () => handleOperatorClick('*'), variant: 'default', className: 'bg-accent text-accent-foreground hover:bg-accent/80' },
    
    { label: '4', handler: () => handleDigitClick('4'), variant: 'outline' },
    { label: '5', handler: () => handleDigitClick('5'), variant: 'outline' },
    { label: '6', handler: () => handleDigitClick('6'), variant: 'outline' },
    { label: '-', handler: () => handleOperatorClick('-'), variant: 'default', className: 'bg-accent text-accent-foreground hover:bg-accent/80' },
    
    { label: '1', handler: () => handleDigitClick('1'), variant: 'outline' },
    { label: '2', handler: () => handleDigitClick('2'), variant: 'outline' },
    { label: '3', handler: () => handleDigitClick('3'), variant: 'outline' },
    { label: '+', handler: () => handleOperatorClick('+'), variant: 'default', className: 'bg-accent text-accent-foreground hover:bg-accent/80' },
    
    { label: '0', handler: () => handleDigitClick('0'), variant: 'outline', className: 'col-span-2 w-full !rounded-full' },
    { label: '.', handler: handleDecimalClick, variant: 'outline' },
    { label: '=', handler: handleEqualsClick, variant: 'default' },
  ];

  return (
    <Card className="max-w-xs w-full p-4 bg-card shadow-2xl border-border/50">
      <CardContent className="p-0">
        <div className="text-right h-24 flex items-end justify-end p-4 mb-4 bg-transparent rounded-lg">
          <p className="text-5xl font-light text-foreground break-all" style={{lineHeight: '1.2'}}>
            {parseFloat(display).toLocaleString('en-US', { maximumFractionDigits: 9 })}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {buttons.map((btn, i) => (
            <Button
              key={i}
              onClick={btn.handler}
              variant={btn.variant as any}
              className={cn(buttonClasses, btn.className)}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
