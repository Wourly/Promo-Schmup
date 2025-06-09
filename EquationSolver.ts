import * as THREE from 'three'

//================================================================================================
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Equation Solver (for intersections)
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
enum ELineEquationType {
	Regular = 1,
	Horizontal = 2,
	Vertical = 3
}

type TLineEquationCoefficients = {
	coA: number,
	coB: number,
	coC: number,
	type: ELineEquationType
}

type T3ArrayDataHolder = [number, number, number];

type TCircleEquationCoefficients = {
	x: number,
	y: number,
	r: number
}

export type TIntersectionPoint = {
	index: number
	coordinates: THREE.Vector2
}

//==============================================================
//========== Class
//==============================================================
export class EquationSolver {

	private static _data:EquationSolver

	intersectionCount:number
	intersectionPoints:Array<TIntersectionPoint>

	line:TLineEquationCoefficients
	lineEquationDataHolder:T3ArrayDataHolder
	circle:TCircleEquationCoefficients
	

	private constructor () {

		this.intersectionCount = 0;
		this.lineEquationDataHolder = [0, 0, 0];

		this.intersectionPoints = new Array();

		this.line = {
			coA: 0,
			coB: 0,
			coC: 0,
			type: ELineEquationType.Regular
		}

		this.circle = {
			x: 0,
			y: 0,
			r: 0
		}
	};

	public static get data () {
		return this._data || (this._data = new this());
	}

	public flush () {

		this.intersectionCount = 0;
		this.intersectionPoints.length = 0;
		this.lineEquationDataHolder = [0, 0, 0]; //!

		this.line.coA = 0;
		this.line.coB = 0;
		this.line.coC = 0;
		this.line.type = ELineEquationType.Regular;

		this.circle.x = 0;
		this.circle.y = 0;
		this.circle.r = 0;
	}

	public setLineEquationFromPoints (v1:THREE.Vector3, v2:THREE.Vector3) {

		// y = ax + c
		// y = coA + coC
	
		// ax + ay + c = 0
	
		let coA:number; 	//coefficient a (coefficient for x)
		let coB:number;		//coefficient b (coefficient for y)
		let coC:number;		//coefficient c (coefficient for constant)
		let slope:number;	//m
		let type:ELineEquationType
		
		const yDifference = v2.y - v1.y;
		const xDifference = v2.x - v1.x;
	
		slope = yDifference / xDifference;
	
		// anything with exception of vertical line
		if (xDifference) {
	
			coB = 1;								// 1y = ...
	
			coA = -1 * slope;							// '-' because it is transferred to left side
			coC = -v1.y + (slope * -v1.x) * -1;	// (y - y1) = slope * (x - x1) -> -y1 + (slope * -x1) * -1

			if (!slope)
				type = ELineEquationType.Horizontal
			else
				type = ELineEquationType.Regular
		}
		// vertical line
		else {
	
			coB = 0; // 0y = ...
	
			coA = -1; // will become x = ...
			coC = v1.x;

			type = ELineEquationType.Vertical
		}
		
		//--------- debug formula log
		//---------------------------------------------------------------
		//console.group("line standard equation");console.log(`${coA ? `${coA}x` : ''}${coB >= 0 ? '+' : ''}${coB}y${coC >= 0 ? '+' : ''}${coC}=0`);console.groupEnd();
	
		this.line.coA = coA;
		this.line.coB = coB;
		this.line.coC = coC;
		this.line.type = type;
	}

	public setLineHolderYfunction () {

		// normally, we would like to change sign of both x and const
		//		as we need them on right side of equation
		// but if y is negative, we will not do that
		//		because we might need to swap them again soon

		let rightedCoA = this.line.coA;
		let rightedCoC = this.line.coC;

		// ..so lets just swap them only once, if y is positive
		if (this.line.coB > 0) {
			rightedCoA *= -1;
			rightedCoC *= -1;
		}

		//--------- debug formula log
		//---------------------------------------------------------------
		//console.group("line Y function"); console.log(`y=${rightedCoA}x${rightedCoC >= 0 ? '+': ''}${rightedCoC}`);console.groupEnd();

		this.lineEquationDataHolder[0] = this.line.coB;
		this.lineEquationDataHolder[1] = rightedCoA;
		this.lineEquationDataHolder[2] = rightedCoC;
	}

	public setLineHolderXfunction () {

		// normally, we would like to change sign of both y and const
		//		as we need them on right side of equation
		// but if x is negative, we will not do that
		//		because we might need to swap them again soon
		let rightedCoB = this.line.coB;
		let rightedCoC = this.line.coC;

		// ..so lets just swap them only once, if x is positive
		if (this.line.coA > 0) {
			rightedCoB *= -1;
			rightedCoC *= -1;
		}

		//--------- debug formula log
		//---------------------------------------------------------------
		//console.group("line X function"); console.log(`x=${rightedCoB}y${rightedCoC >= 0 ? '+': ''}${rightedCoC}`);console.groupEnd();

		this.lineEquationDataHolder[0] = 1;
		this.lineEquationDataHolder[1] = rightedCoB;
		this.lineEquationDataHolder[2] = rightedCoC;
	}

	public setCircleEquation(positionX:number, positionY:number, radius:number) {

		// standard
		// (x - x1)^2 + (y-y1)^2 = r^2
		// general
		// (x - x1)^2 + (y-y1)^2 - (r^2) = 0

		const x = -positionX;
		const y = -positionY;

		const squaredRadius = radius * radius;

		//--------- debug formula log
		//---------------------------------------------------------------
		//console.group("circle standard equation");console.log(`(x${x >= 0 ? '+' : ''}${x})^2+(y${y >= 0 ? '+' : ''}${y})^2=${squaredRadius}`);console.groupEnd();

		this.circle.x = x;
		this.circle.y = y;
		this.circle.r = squaredRadius;
	}

	public getCircleGeneralEquationVariables () {

		const squaredRadiusToLeftSide = this.circle.r * -1;

		//--------- debug formula log
		//---------------------------------------------------------------
		//console.group("circle general equation");console.log(`(x${this.circle.x >= 0 ? '+' : ''}${this.circle.x})^2+(y${this.circle.y >= 0 ? '+' : ''}${this.circle.y})^2${squaredRadiusToLeftSide >= 0 ? '+' : ''}${squaredRadiusToLeftSide}=0`);console.groupEnd()

		return [this.circle.x, this.circle.y, squaredRadiusToLeftSide];
	}

	public solveLineCircleIntersection (index:number) {

		const lineType = this.line.type;

		let rightSideLineCoefficient, leftSideLineCoefficient, altBrVarCoeff, lineConstant, soBrValue, altBrValue;
		const [circleXValue, circleYValue, circleSquaredRadius] = this.getCircleGeneralEquationVariables()

		//---------------------------------------------------------------
		//---------		line
		//
		//		rightSideLineCoefficient = leftSideLineCoefficient + lineConstant
		//
		//---------------------------------------------------------------
		//---------		circle
		//
		//		(x - circleXValue)^2 + (y - circleYValue)^2 - circleSquaredRadius = 0
		//
		//---------------------------------------------------------------
		//---------		interpolation
		//
		//		(x - circleXValue)^2 + (x * altBrVarCoeff + altBrValue)^2 - circleSquaredRadius = 0
		//
		//---------------------------------------------------------------
		//---------		terminology
		//
		//		soBrValue -> solidBracketValue
		//			value, which is unaffected
		//		altBrValue -> alternatedBracketValue
		//			value in bracket with substitution
		//		altBrVarCoeff -> alternatedBracketVariableCoefficient
		//			multiplier, that is the effect of line's slope
		//
		//---------------------------------------------------------------
		if (lineType !== ELineEquationType.Vertical) {
			// y = x + c
			this.setLineHolderYfunction();

			rightSideLineCoefficient = this.lineEquationDataHolder[0];
			leftSideLineCoefficient = this.lineEquationDataHolder[1];
			lineConstant = this.lineEquationDataHolder[2];
			
			soBrValue = circleXValue;
			altBrValue = circleYValue + lineConstant;		// alteredBracketValue with y

		}
		else {
			// x = y + c
			this.setLineHolderXfunction();

			rightSideLineCoefficient = this.lineEquationDataHolder[0];
			leftSideLineCoefficient = this.lineEquationDataHolder[1];
			lineConstant = this.lineEquationDataHolder[2];

			soBrValue = circleYValue;
			altBrValue = circleXValue + lineConstant;		// alteredBracketValue with x
		}

		altBrVarCoeff = leftSideLineCoefficient;

		const quadraticCount = 1 + Math.pow(altBrVarCoeff, 2);
		const linearCount = (2 * soBrValue) + (2 * altBrVarCoeff * altBrValue);
		const constantCount = circleSquaredRadius + Math.pow(altBrValue, 2) + Math.pow(soBrValue, 2);

		//--------- debug formula log
		//---------------------------------------------------------------
		//console.group("Intersection formula");console.log(`2x^2${linearCount >= 0 ? '+' : ''}${linearCount}x${constantCount >= 0 ? '+' : ''}${constantCount}=0`);console.groupEnd();
		
		const discriminant = Math.pow(linearCount, 2) + (-4 * quadraticCount * constantCount);

		let localIntersectionCount = 0;

		if (discriminant > 0) {
			localIntersectionCount = 2;
		} else if (discriminant === 0) {
			localIntersectionCount = 1;
		} else {
			return;
		}

		const divisor = 2 * quadraticCount;
		const squaredDiscriminant = Math.sqrt(discriminant);

		const result1 = (-linearCount + squaredDiscriminant) / divisor;
		const result2 = (-linearCount - squaredDiscriminant) / divisor;

		let x1, x2, y1, y2;

		if (lineType !== ELineEquationType.Vertical) {

			x1 = result1;
			x2 = result2;

			y1 = leftSideLineCoefficient * x1 + lineConstant;
			y2 = leftSideLineCoefficient * x2 + lineConstant;

		} else {

			// vertical line function does not have a slope, only constant
			y1 = result1;
			y2 = result2;

			x1 = lineConstant;
			x2 = lineConstant;
		}

		if (localIntersectionCount === 2) {

			this.intersectionCount += 2;
			this.addIntersectionPoint(index, x1, y1);
			this.addIntersectionPoint(index, x2, y2);

		} else if (localIntersectionCount === 1) {
			
			this.intersectionCount += 1;
			this.addIntersectionPoint(index, x1, y1);
		}
	}

	private addIntersectionPoint (index:number, x:number, y:number) {
		this.intersectionPoints.push({
			index: index,
			coordinates: new THREE.Vector2(x, y)
		});
	}

	public getClosestIntersectionPoint (origin:THREE.Vector3) {

		const origin2D = new THREE.Vector2(origin.x, origin.y);

		let minDistance = Infinity;
		let candidate;

		//console.log(this.intersectionPoints)
		
		for (const point of this.intersectionPoints) {        //! better to do numbered loop later
			const currentDistance = point.coordinates.distanceTo(origin2D);

			if (currentDistance < minDistance) {
				minDistance = currentDistance;
				candidate = point;
			}
		}

		return candidate;

	}

	public filterPointsWithCorrectDirection (position: THREE.Vector3, direction:THREE.Vector3) {

		let readIndex = 0;
		let writeIndex = 0;

		const length = this.intersectionPoints.length;

		const xPosFromZero = position.x;
		const yPosFromZero = position.y;

		for (; readIndex < length; readIndex++) {

			const point = this.intersectionPoints[readIndex];
	
			const normalizedPointX = point.coordinates.x - xPosFromZero;
			const normalizedPointY = point.coordinates.y - yPosFromZero;

			const directionSignX = Math.sign(direction.x);
			const directionSignY = Math.sign(direction.y);

			const normalizedPointSignX = Math.sign(normalizedPointX);
			const normalizedPointSignY = Math.sign(normalizedPointY);
			//debugger

			
			if (normalizedPointSignX !== 0 && direction.x !== 0)
				if (normalizedPointSignX !== directionSignX) {
					continue;
				}

			if (normalizedPointSignY !== 0 && direction.y !== 0)
				if (normalizedPointSignY !== directionSignY) {
					continue;
				}

			this.intersectionPoints[writeIndex++] = point;
		}
	
		const newLength = length - (readIndex - writeIndex);
		this.intersectionPoints.length = newLength;
		
	}
}

