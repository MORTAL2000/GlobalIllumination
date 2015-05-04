uniform sampler2D shadowMap;
varying vec4 shadowCoord;
varying vec3 N;
varying vec3 v;
uniform vec3 lightPosition;
uniform int width;
uniform int height;
uniform int shadowMapWidth;
uniform int shadowMapHeight;

float computePreEvaluationBasedOnNormalOrientation()
{

	vec3 L = normalize(lightPosition.xyz - v);   
	vec3 N2 = N;

	if(!gl_FrontFacing)
		N2 *= -1;

	if(max(dot(N2,L), 0.0) == 0) 
		return 0.0;
	else
		return 1.0;

}

void main()
{	

	vec4 normalizedLightCoord = shadowCoord / shadowCoord.w;
	
	vec2 shadowMapSize = vec2(shadowMapWidth, shadowMapHeight);
	vec2 shadowMapStep = 1.0/shadowMapSize;

	if(normalizedLightCoord.x < 0.0 || normalizedLightCoord.x > 1.0 || normalizedLightCoord.y < 0.0 || normalizedLightCoord.y > 1.0) {
	
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	
	} else {


		float center = computePreEvaluationBasedOnNormalOrientation();
		bool isCenterUmbra = !bool(center);
		float distanceFromLight;

		if(!isCenterUmbra) {
			distanceFromLight = texture2D(shadowMap, normalizedLightCoord.st).z;
			center = (normalizedLightCoord.z <= distanceFromLight) ? 1.0 : 0.0; 
			isCenterUmbra = !bool(center);
		}

		float red = 0.0;
		float green = 0.0;
	
		//Entering discontinuity, where the current fragment is outside the umbra and the neighbour is inside the umbra
		if(!isCenterUmbra) {
		
			normalizedLightCoord.x -= shadowMapStep.x;
			distanceFromLight = texture2D(shadowMap, normalizedLightCoord.st).z;
			float left = (normalizedLightCoord.z <= distanceFromLight) ? 1.0 : 0.0; 
	
			normalizedLightCoord.x += shadowMapStep.x;
			normalizedLightCoord.x += shadowMapStep.x;
			distanceFromLight = texture2D(shadowMap, normalizedLightCoord.st).z;
			float right = (normalizedLightCoord.z <= distanceFromLight) ? 1.0 : 0.0; 
	
			normalizedLightCoord.x -= shadowMapStep.x;
			normalizedLightCoord.y += shadowMapStep.y;
			distanceFromLight = texture2D(shadowMap, normalizedLightCoord.st).z;
			float bottom = (normalizedLightCoord.z <= distanceFromLight) ? 1.0 : 0.0; 
	
			normalizedLightCoord.y -= shadowMapStep.y;
			normalizedLightCoord.y -= shadowMapStep.y;
			distanceFromLight = texture2D(shadowMap, normalizedLightCoord.st).z;
			float top = (normalizedLightCoord.z <= distanceFromLight) ? 1.0 : 0.0; 
	
			bool isLeftUmbra = !bool(left);
			bool isRightUmbra = !bool(right);
			bool isBottomUmbra = !bool(bottom);
			bool isTopUmbra = !bool(top);

			if(!isLeftUmbra && !isRightUmbra) red = 0.0;
			if(isLeftUmbra) red = 0.5;
			if(isLeftUmbra && isRightUmbra) red = 0.75;
			if(isRightUmbra) red = 1.0;
	
			if(!isBottomUmbra && !isTopUmbra) green = 0.0;
			if(isBottomUmbra) green = 0.5;
			if(isBottomUmbra && isTopUmbra) green = 0.75;
			if(isTopUmbra) green = 1.0;

		}

		gl_FragColor =  vec4(red, green, 0.0, 1.0);
	
	}

}