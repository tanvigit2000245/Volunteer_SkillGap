import React from 'react';
import LocationRequirements from './LocationRequirements.jsx';
import CandidateMatchingPool from './CandidateMatchingPool.jsx';
export default function PlannerTab(props) {
 return <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
  <LocationRequirements {...props}/>
  <CandidateMatchingPool {...props}/>
 </div>;
}
