import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {List} from './pages/List';
import { Test } from "./pages/Test";
import {SingleChld} from './pages/SingleChild';
import {UseEffect} from './pages/UseEffect';
import {BailOut} from './pages/BailOut';
import {Concurrent} from './pages/Concurrent';
import {APage} from './pages/APage';
import {ClickEvent} from './pages/ClickEvent';
import {Diff} from './pages/Diff';
import {UseContext} from './pages/UseContext';
import {UseRef} from './pages/UseRef';
import {SearchUser} from './pages/SearchUser';
import {WebSocketTest} from './pages/mvc/WebSocket';
import EffectOrder from './pages/EffectOrder';
import CleanupSibling from './pages/CleanupSibling';
import UseStateVsSetState from './pages/UseStateVsSetState';
import ClosureAnalysis from './pages/ClosureAnalysis';
import ReactWorkflowAnalysis from './pages/ReactWorkflowAnalysis';
import LayoutEffectAnalysis from './pages/LayoutEffectAnalysis';
import JSAndGUIThreadAnalysis from './pages/JSAndGUIThreadAnalysis';
import ReconciliationAndDiffAnalysis from './pages/ReconciliationAndDiffAnalysis';
import FiberReuseAnalysis from './pages/FiberReuseAnalysis';
import DiffNodeReuseAnalysis from './pages/DiffNodeReuseAnalysis';
import TreeDiffLayerAnalysis from './pages/TreeDiffLayerAnalysis';
import ComponentTypeChangeAnalysis from './pages/ComponentTypeChangeAnalysis';
import DeletionOrderAnalysis from './pages/DeletionOrderAnalysis';
import UseEffectCleanupOrderAnalysis from './pages/UseEffectCleanupOrderAnalysis';
import UseEffectCleanupDOMTimingAnalysis from './pages/UseEffectCleanupDOMTimingAnalysis';
import ReactMemoAnalysis from './pages/ReactMemoAnalysis';
import CrossLevelDiffAnalysis from './pages/CrossLevelDiffAnalysis';
import SingleVsArrayChildrenAnalysis from './pages/SingleVsArrayChildrenAnalysis';
import NewChildSourceAnalysis from './pages/NewChildSourceAnalysis';
import HookOrderCheckAnalysis from './pages/HookOrderCheckAnalysis';
import DidRenderTooFewHooksAnalysis from './pages/DidRenderTooFewHooksAnalysis';
import CurrentHookFinalPositionAnalysis from './pages/CurrentHookFinalPositionAnalysis';
import PlacementMechanismAnalysis from './pages/PlacementMechanismAnalysis';
import PlacementIndexAnalysis from './pages/PlacementIndexAnalysis';
import CommitPhaseIndexUsageAnalysis from './pages/CommitPhaseIndexUsageAnalysis';
import CommitDOMOperationOrderAnalysis from './pages/CommitDOMOperationOrderAnalysis';
import UseLayoutEffectTimingAnalysis from './pages/UseLayoutEffectTimingAnalysis';
import UseLayoutEffectBrowserRenderingAnalysis from './pages/UseLayoutEffectBrowserRenderingAnalysis';
import UseEffectSchedulingAnalysis from './pages/UseEffectSchedulingAnalysis';
import RenderCommitPhaseAnalysis from './pages/RenderCommitPhaseAnalysis';
import ReactInterviewQuestions from './pages/ReactInterviewQuestions';
import FiberTypeAnalysis from './pages/FiberTypeAnalysis';
import BeginWorkHooksAnalysis from './pages/BeginWorkHooksAnalysis';
import DOMOperationAndRenderingAnalysis from './pages/DOMOperationAndRenderingAnalysis';
import EffectCleanupTimingAnalysis from './pages/EffectCleanupTimingAnalysis';
import VirtualListInterview from './pages/VirtualListInterview';
import TypeScriptInterviewQuestions from './pages/TypeScriptInterviewQuestions';
import ReactRefsAnalysis from './pages/ReactRefsAnalysis';
import TimeSlicingAnalysis from './pages/TimeSlicingAnalysis';
import EventDelegationAnalysis from './pages/EventDelegationAnalysis';
import RequestAnimationFrameAnalysis from './pages/RequestAnimationFrameAnalysis';
import TimeSliceUnitAnalysis from './pages/TimeSliceUnitAnalysis';
import UseMemoRenderPhase from './pages/UseMemoRenderPhase';
import RefUnmountAnalysis from './pages/RefUnmountAnalysis';
import TimeSlicingContinuationAnalysis from './pages/TimeSlicingContinuationAnalysis';
import DesignPatternsInterview from './pages/DesignPatternsInterview';
import WhyFiberIntroduced from './pages/WhyFiberIntroduced';
import ReactSchedulingAnalysis from './pages/ReactSchedulingAnalysis';
import reportWebVitals from './reportWebVitals';
import { AutoComplete } from './pages/AutoComplete'
import { DialogDemo } from './pages/DialogDemo'
import {  UploadDemo } from './pages/Upload'
import {  CalendarDemo } from './pages/CalendarDemo'
import {  TSXDemo } from './pages/TSXDemo'
import { WaterfallDemo } from './pages/WaterfallDemo'
import { PositionDemo } from './pages/PositionDemo'
import { ModalDemo  } from "./pages/ModalDemo";


const root = ReactDOM.createRoot(
  document.getElementById('root')
);

// root.render(<Concurrent />)
// root.render(<UseRef />)
// root.render(<Diff />)
// root.render(<WebSocketTest />)
// root.render(<PositionDemo />)
root.render(<Test />)
// root.render(<SearchUser />)
// root.render(<UseContext />)
// root.render(<UseEffect />)
// root.render(<BailOut />)
// root.render(<List />)
// root.render(<ClickEvent />)
// root.render(<APage />)
// root.render(<EffectOrder />)
// root.render(<CleanupSibling />)
// root.render(<UseStateVsSetState />)
// root.render(<ClosureAnalysis />)
// root.render(<ReactWorkflowAnalysis />)
// root.render(<LayoutEffectAnalysis />)
// root.render(<JSAndGUIThreadAnalysis />)
// root.render(<ReconciliationAndDiffAnalysis />)
// root.render(<FiberReuseAnalysis />)
// root.render(<DiffNodeReuseAnalysis />)
// root.render(<TreeDiffLayerAnalysis />)
// root.render(<ComponentTypeChangeAnalysis />)
// root.render(<DeletionOrderAnalysis />)
// root.render(<UseEffectCleanupOrderAnalysis />)
// root.render(<UseEffectCleanupDOMTimingAnalysis />)
// root.render(<ReactMemoAnalysis />)
// root.render(<CrossLevelDiffAnalysis />)
// root.render(<SingleVsArrayChildrenAnalysis />)
// root.render(<NewChildSourceAnalysis />)
// root.render(<HookOrderCheckAnalysis />)
// root.render(<DidRenderTooFewHooksAnalysis />)
// root.render(<CurrentHookFinalPositionAnalysis />)
// root.render(<PlacementMechanismAnalysis />)
// root.render(<PlacementIndexAnalysis />)
// root.render(<CommitPhaseIndexUsageAnalysis />)
// root.render(<CommitDOMOperationOrderAnalysis />)
// root.render(<UseLayoutEffectTimingAnalysis />)
// root.render(<UseLayoutEffectBrowserRenderingAnalysis />)
// root.render(<UseEffectSchedulingAnalysis />)
// root.render(<RenderCommitPhaseAnalysis />)
// root.render(<ReactInterviewQuestions />)
// root.render(<FiberTypeAnalysis />)
// root.render(<BeginWorkHooksAnalysis />)
// root.render(<DOMOperationAndRenderingAnalysis />)
// root.render(<EffectCleanupTimingAnalysis />)
// root.render(<SystemDesignInterview />)
// root.render(<WaterfallDemo />)
// root.render(<VirtualListInterview />)
// root.render(<TypeScriptInterviewQuestions />)
// root.render(<WhyFiberIntroduced />)
// root.render(<TimeSlicingAnalysis />)
// root.render(<EventDelegationAnalysis />)
// root.render(<RequestAnimationFrameAnalysis />)
// root.render(<TimeSliceUnitAnalysis />)
// root.render(<UseMemoRenderPhase />)
// root.render(<RefUnmountAnalysis />)
// root.render(<TimeSlicingContinuationAnalysis />)
// root.render(<ReactSchedulingAnalysis />)
// root.render(<DesignPatternsInterview />)
// root.render(<SingleChld />)
// root.render(<AutoComplete />)
// root.render(<DialogDemo />)
// root.render(<UploadDemo />)
// root.render(<CalendarDemo />)
// root.render(<TSXDemo />)
// root.render(<WaterfallDemo />)
// root.render(<PositionDemo />)
// root.render(<ModalDemo />)

// root.render(<ReactRefsAnalysis />);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
