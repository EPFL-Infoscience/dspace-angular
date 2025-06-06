import { hasValue, isEmpty, isNotEmpty, isNotNull, isUndefined } from '../../shared/empty.util';
import differenceWith from 'lodash/differenceWith';
import findKey from 'lodash/findKey';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

import {
  ChangeSubmissionCollectionAction,
  CleanDetectDuplicateAction,
  CompleteInitSubmissionFormAction,
  DeleteSectionErrorsAction,
  DeleteUploadedFileAction,
  DepositSubmissionAction,
  DepositSubmissionErrorAction,
  DepositSubmissionSuccessAction,
  DisableSectionAction,
  DisableSectionErrorAction,
  DiscardSubmissionSuccessAction,
  EditFileDataAction,
  EnableSectionAction,
  ExecuteExternalUploadAction,
  ExecuteExternalUploadErrorAction,
  InertSectionErrorsAction,
  InitSectionAction,
  InitSubmissionFormAction,
  NewUploadedFileAction,
  RemoveSectionErrorsAction,
  ResetSubmissionFormAction,
  SaveAndDepositSubmissionAction,
  SaveForLaterSubmissionFormAction,
  SaveForLaterSubmissionFormErrorAction,
  SaveForLaterSubmissionFormSuccessAction,
  SaveSubmissionFormAction,
  SaveSubmissionFormErrorAction,
  SaveSubmissionFormSuccessAction,
  SaveSubmissionSectionFormAction,
  SaveSubmissionSectionFormErrorAction,
  SaveSubmissionSectionFormSuccessAction,
  SectionStatusChangeAction,
  SetActiveSectionAction,
  SetDuplicateDecisionAction,
  SetDuplicateDecisionErrorAction,
  SetDuplicateDecisionSuccessAction,
  SetSectionFormId,
  SubmissionObjectAction,
  SubmissionObjectActionTypes,
  UpdateSectionDataAction,
  UpdateSectionErrorsAction,
  UpdateSectionVisibilityAction
} from './submission-objects.actions';
import { WorkspaceitemSectionUploadObject } from '../../core/submission/models/workspaceitem-section-upload.model';
import {
  WorkspaceitemSectionDetectDuplicateObject
} from '../../core/submission/models/workspaceitem-section-deduplication.model';
import { SubmissionSectionObject } from './submission-section-object.model';
import { MetadataSecurityConfiguration } from '../../core/submission/models/metadata-security-configuration';
import { SubmissionSectionError } from './submission-section-error.model';

/**
 * An interface to represent SubmissionSectionObject entry
 */
export interface SubmissionSectionEntry {
  [sectionId: string]: SubmissionSectionObject;
}

/**
 * An interface to represent submission object state
 */
export interface SubmissionObjectEntry {
  /**
   * The collection this submission belonging to
   */
  collection?: string;

  /**
   * The configuration name that define this submission
   */
  definition?: string;

  /**
   * The submission self url
   */
  selfUrl?: string;

  /**
   * The submission active section
   */
  activeSection?: string;

  /**
   * The list of submission's sections
   */
  sections?: SubmissionSectionEntry;

  /**
   * A boolean representing if this submission is loading
   */
  isLoading?: boolean;

  /**
   * A boolean representing if a submission save operation is pending
   */
  savePending?: boolean;

  /**
   * A boolean representing if a duplicate decision is pending
   */
  saveDecisionPending?: boolean;

  /**
   * A boolean representing if an external upload is pending
   */
  externalUploadPending?: boolean;

  /**
   * A boolean representing if a submission deposit operation is pending
   */
  depositPending?: boolean;
  /**
   * Configurations of security levels for metadatas of an entity type
   */
  metadataSecurityConfiguration?: MetadataSecurityConfiguration;

  /**
   * A boolean representing if a submission is discarded or not
   */
   isDiscarding?: boolean;
}

/**
 * The Submission State
 *
 * Consists of a map with submission's ID as key,
 * and SubmissionObjectEntries as values
 */
export interface SubmissionObjectState {
  [submissionId: string]: SubmissionObjectEntry;
}

const initialState: SubmissionObjectState = Object.create({});

export function submissionObjectReducer(state = initialState, action: SubmissionObjectAction): SubmissionObjectState {
  switch (action.type) {

    // submission form actions
    case SubmissionObjectActionTypes.COMPLETE_INIT_SUBMISSION_FORM: {
      return completeInit(state, action as CompleteInitSubmissionFormAction);
    }

    case SubmissionObjectActionTypes.INIT_SUBMISSION_FORM: {
      return initSubmission(state, action as InitSubmissionFormAction);
    }

    case SubmissionObjectActionTypes.RESET_SUBMISSION_FORM: {
      return resetSubmission(state, action as ResetSubmissionFormAction);
    }

    case SubmissionObjectActionTypes.CANCEL_SUBMISSION_FORM: {
      return initialState;
    }

    case SubmissionObjectActionTypes.SAVE_SUBMISSION_FORM:
    case SubmissionObjectActionTypes.SAVE_FOR_LATER_SUBMISSION_FORM:
    case SubmissionObjectActionTypes.SAVE_AND_DEPOSIT_SUBMISSION:
    case SubmissionObjectActionTypes.SAVE_SUBMISSION_SECTION_FORM: {
      return saveSubmission(state, action as SaveSubmissionFormAction);
    }

    case SubmissionObjectActionTypes.SAVE_SUBMISSION_FORM_SUCCESS:
    case SubmissionObjectActionTypes.SAVE_SUBMISSION_SECTION_FORM_SUCCESS:
    case SubmissionObjectActionTypes.SAVE_SUBMISSION_FORM_ERROR:
    case SubmissionObjectActionTypes.SAVE_FOR_LATER_SUBMISSION_FORM_ERROR:
    case SubmissionObjectActionTypes.SAVE_SUBMISSION_SECTION_FORM_ERROR: {
      return completeSave(state, action as SaveSubmissionFormErrorAction);
    }

    case SubmissionObjectActionTypes.CHANGE_SUBMISSION_COLLECTION: {
      return changeCollection(state, action as ChangeSubmissionCollectionAction);
    }

    case SubmissionObjectActionTypes.DEPOSIT_SUBMISSION: {
      return startDeposit(state, action as DepositSubmissionAction);
    }

    case SubmissionObjectActionTypes.DEPOSIT_SUBMISSION_SUCCESS: {
      return initialState;
    }

    case SubmissionObjectActionTypes.DEPOSIT_SUBMISSION_ERROR: {
      return endDeposit(state, action as DepositSubmissionAction);
    }

    case SubmissionObjectActionTypes.DISCARD_SUBMISSION: {
      return state;
    }

    case SubmissionObjectActionTypes.DISCARD_SUBMISSION_SUCCESS: {
      return discardSuccess(state, action as DiscardSubmissionSuccessAction);
    }

    case SubmissionObjectActionTypes.DISCARD_SUBMISSION_ERROR: {
      return state;
    }

    case SubmissionObjectActionTypes.SET_ACTIVE_SECTION: {
      return setActiveSection(state, action as SetActiveSectionAction);
    }

    // Section actions

    case SubmissionObjectActionTypes.INIT_SECTION: {
      return initSection(state, action as InitSectionAction);
    }

    case SubmissionObjectActionTypes.SET_SECTION_FORM_ID: {
      return setSectionFormId(state, action as SetSectionFormId);
    }

    case SubmissionObjectActionTypes.UPDATE_SECTION_VISIBILITY: {
      return setVisibility(state, action as UpdateSectionVisibilityAction);
    }

    case SubmissionObjectActionTypes.ENABLE_SECTION: {
      return changeSectionState(state, action as EnableSectionAction, true);
    }

    case SubmissionObjectActionTypes.UPDATE_SECTION_DATA: {
      return updateSectionData(state, action as UpdateSectionDataAction);
    }

    case SubmissionObjectActionTypes.UPDATE_SECTION_ERRORS: {
      return updateSectionErrors(state, action as UpdateSectionErrorsAction);
    }

    case SubmissionObjectActionTypes.DISABLE_SECTION: {
      return changeSectionRemoveState(state, action as DisableSectionAction, true);
    }

    case SubmissionObjectActionTypes.DISABLE_SECTION_SUCCESS: {
      return changeSectionState(state, action as DisableSectionAction, false);
    }

    case SubmissionObjectActionTypes.DISABLE_SECTION_ERROR: {
      return changeSectionRemoveState(state, action as DisableSectionErrorAction, false);
    }

    case SubmissionObjectActionTypes.SECTION_STATUS_CHANGE: {
      return setIsValid(state, action as SectionStatusChangeAction);
    }

    // Files actions
    case SubmissionObjectActionTypes.NEW_FILE: {
      return newFile(state, action as NewUploadedFileAction);
    }

    case SubmissionObjectActionTypes.EDIT_FILE_DATA: {
      return editFileData(state, action as EditFileDataAction);
    }

    case SubmissionObjectActionTypes.DELETE_FILE: {
      return deleteFile(state, action as DeleteUploadedFileAction);
    }

    // errors actions
    case SubmissionObjectActionTypes.ADD_SECTION_ERROR: {
      return addError(state, action as InertSectionErrorsAction);
    }

    case SubmissionObjectActionTypes.DELETE_SECTION_ERROR: {
      return removeError(state, action as DeleteSectionErrorsAction);
    }

    case SubmissionObjectActionTypes.REMOVE_SECTION_ERRORS: {
      return removeSectionErrors(state, action as RemoveSectionErrorsAction);
    }

    // detect duplicate
    case SubmissionObjectActionTypes.SET_DUPLICATE_DECISION: {
      return startSaveDecision(state, action as SetDuplicateDecisionAction);
    }

    case SubmissionObjectActionTypes.SET_DUPLICATE_DECISION_SUCCESS: {
      return setDuplicateMatches(state, action as SetDuplicateDecisionSuccessAction);
    }

    case SubmissionObjectActionTypes.SET_DUPLICATE_DECISION_ERROR: {
      return endSaveDecision(state, action as SetDuplicateDecisionErrorAction);
    }

    case SubmissionObjectActionTypes.CLEAN_DETECT_DUPLICATE: {
      return cleanDetectDuplicateSection(state, action as CleanDetectDuplicateAction);
    }

    //external upload
    case SubmissionObjectActionTypes.EXECUTE_EXTERNAL_UPLOAD: {
      return startExternalUploadExecution(state, action as ExecuteExternalUploadAction);
    }

    case SubmissionObjectActionTypes.EXECUTE_EXTERNAL_UPLOAD_ERROR: {
      return updateExternalUploadState(state, action.payload.submissionId, action.payload.sectionId, (action as ExecuteExternalUploadErrorAction).payload.errors);
    }

    case SubmissionObjectActionTypes.EXECUTE_EXTERNAL_UPLOAD_SUCCESS: {
      return updateExternalUploadState(state, action.payload.submissionId, action.payload.sectionId, []);
    }

    default: {
      return state;
    }
  }
}

// ------ Submission error functions ------ //

const removeError = (state: SubmissionObjectState, action: DeleteSectionErrorsAction): SubmissionObjectState => {
  const { submissionId, sectionId, errors } = action.payload;

  if (hasValue(state[ submissionId ].sections[ sectionId ])) {
    let filteredErrors;

    if (Array.isArray(errors)) {
      filteredErrors = differenceWith(errors, errors, isEqual);
    } else {
      filteredErrors = state[ submissionId ].sections[ sectionId ].errorsToShow
        .filter((currentError) => currentError.path !== errors.path || !isEqual(currentError, errors));
    }

    return Object.assign({}, state, {
      [ submissionId ]: Object.assign({}, state[ submissionId ], {
        sections: Object.assign({}, state[ submissionId ].sections, {
          [ sectionId ]: Object.assign({}, state[ submissionId ].sections [ sectionId ], {
            errorsToShow: filteredErrors
          })
        })
      })
    });
  } else {
    return state;
  }
};

const addError = (state: SubmissionObjectState, action: InertSectionErrorsAction): SubmissionObjectState => {
  const { submissionId, sectionId, error } = action.payload;

  if (hasValue(state[ submissionId ].sections[ sectionId ])) {
    const errorsToShow = uniqWith(state[ submissionId ].sections[ sectionId ].errorsToShow.concat(error), isEqual);

    return Object.assign({}, state, {
      [ submissionId ]: Object.assign({}, state[ submissionId ], {
        activeSection: state[ action.payload.submissionId ].activeSection,        sections: Object.assign({}, state[ submissionId ].sections, {
          [ sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections [ action.payload.sectionId ], {
            errorsToShow
          })
        }),
      })
    });
  } else {
    return state;
  }
};

/**
 * Remove all section's errors.
 *
 * @param state
 *    the current state
 * @param action
 *    a RemoveSectionErrorsAction
 * @return SubmissionObjectState
 *    the new state, with the section's errorsToShow updated.
 */
function removeSectionErrors(state: SubmissionObjectState, action: RemoveSectionErrorsAction): SubmissionObjectState {
  if (isNotEmpty(state[ action.payload.submissionId ])
    && isNotEmpty(state[ action.payload.submissionId ].sections[ action.payload.sectionId])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        sections: Object.assign({}, state[ action.payload.submissionId ].sections, {
          [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections [ action.payload.sectionId ], {
            errorsToShow: []
          })
        })
      })
    });
  } else {
    return state;
  }
}

// ------ Submission functions ------ //

/**
 * Init a SubmissionObjectState.
 *
 * @param state
 *    the current state
 * @param action
 *    an InitSubmissionFormAction | ResetSubmissionFormAction
 * @return SubmissionObjectState
 *    the new state, with the section removed.
 */
function initSubmission(state: SubmissionObjectState, action: InitSubmissionFormAction | ResetSubmissionFormAction): SubmissionObjectState {

  const newState = Object.assign({}, state);
  newState[ action.payload.submissionId ] = {
    collection: action.payload.collectionId,
    definition: action.payload.submissionDefinition.name,
    selfUrl: action.payload.selfUrl,
    activeSection: null,
    sections: Object.create(null),
    isLoading: true,
    savePending: false,
    saveDecisionPending: false,
    externalUploadPending: false,
    depositPending: false,
    metadataSecurityConfiguration: action.payload.metadataSecurityConfiguration,
    isDiscarding: false
  };
  return newState;
}

/**
 * Reset submission.
 *
 * @param state
 *    the current state
 * @param action
 *    a ResetSubmissionFormAction
 * @return SubmissionObjectState
 *    the new state, with the section removed.
 */
function resetSubmission(state: SubmissionObjectState, action: ResetSubmissionFormAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        sections: Object.create(null),
        isLoading: true
      })
    });
  } else {
    return state;
  }
}

/**
 * Set submission loading to false.
 *
 * @param state
 *    the current state
 * @param action
 *    a CompleteInitSubmissionFormAction
 * @return SubmissionObjectState
 *    the new state, with the section removed.
 */
function completeInit(state: SubmissionObjectState, action: CompleteInitSubmissionFormAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        isLoading: false
      })
    });
  } else {
    return state;
  }
}

/**
 * Set submission discard to true.
 *
 * @param state
 *    the current state
 * @param action
 *    a DiscardSubmissionSuccessAction
 * @return SubmissionObjectState
 *    the new state, with the discard success.
 */
 function discardSuccess(state: SubmissionObjectState, action: DiscardSubmissionSuccessAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        isDiscarding: true
      })
    });
  } else {
    return state;
  }
}

/**
 * Set submission save flag to true
 *
 * @param state
 *    the current state
 * @param action
 *    a SaveSubmissionFormAction | SaveSubmissionSectionFormAction
 *    | SaveForLaterSubmissionFormAction | SaveAndDepositSubmissionAction
 * @return SubmissionObjectState
 *    the new state, with the flag set to true.
 */
function saveSubmission(state: SubmissionObjectState,
                        action: SaveSubmissionFormAction
                          | SaveSubmissionSectionFormAction
                          | SaveForLaterSubmissionFormAction
                          | SaveAndDepositSubmissionAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        activeSection: state[ action.payload.submissionId ].activeSection,
        sections: state[ action.payload.submissionId ].sections,
        isLoading: state[ action.payload.submissionId ].isLoading,
        savePending: true,
      })
    });
  } else {
    return state;
  }
}

/**
 * Set submission save flag to false.
 *
 * @param state
 *    the current state
 * @param action
 *    a SaveSubmissionFormSuccessAction | SaveForLaterSubmissionFormSuccessAction
 *    | SaveSubmissionSectionFormSuccessAction | SaveSubmissionFormErrorAction
 *    | SaveForLaterSubmissionFormErrorAction | SaveSubmissionSectionFormErrorAction
 * @return SubmissionObjectState
 *    the new state, with the flag set to false.
 */
function completeSave(state: SubmissionObjectState,
                      action: SaveSubmissionFormSuccessAction
                        | SaveForLaterSubmissionFormSuccessAction
                        | SaveSubmissionSectionFormSuccessAction
                        | SaveSubmissionFormErrorAction
                        | SaveForLaterSubmissionFormErrorAction
                        | SaveSubmissionSectionFormErrorAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        savePending: false,
      })
    });
  } else {
    return state;
  }
}

/**
 * Set deposit flag to true
 *
 * @param state
 *    the current state
 * @param action
 *    a DepositSubmissionAction
 * @return SubmissionObjectState
 *    the new state, with the deposit flag changed.
 */
function startDeposit(state: SubmissionObjectState, action: DepositSubmissionAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        savePending: false,
        depositPending: true,
      })
    });
  } else {
    return state;
  }
}

/**
 * Set deposit flag to false
 *
 * @param state
 *    the current state
 * @param action
 *    a DepositSubmissionSuccessAction or a DepositSubmissionErrorAction
 * @return SubmissionObjectState
 *    the new state, with the deposit flag changed.
 */
function endDeposit(state: SubmissionObjectState, action: DepositSubmissionSuccessAction | DepositSubmissionErrorAction | DepositSubmissionAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        depositPending: false,
      })
    });
  } else {
    return state;
  }
}

/**
 * Init a SubmissionObjectState.
 *
 * @param state
 *    the current state
 * @param action
 *    an InitSubmissionFormAction
 * @return SubmissionObjectState
 *    the new state, with the section removed.
 */
function changeCollection(state: SubmissionObjectState, action: ChangeSubmissionCollectionAction): SubmissionObjectState {
  return Object.assign({}, state, {
    [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
      collection: action.payload.collectionId
    })
  });
}

// ------ Section functions ------ //

/**
 * Set submission active section.
 *
 * @param state
 *    the current state
 * @param action
 *    a SetActiveSectionAction
 * @return SubmissionObjectState
 *    the new state, with the active section.
 */
function setActiveSection(state: SubmissionObjectState, action: SetActiveSectionAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        activeSection: action.payload.sectionId,
        sections: state[ action.payload.submissionId ].sections,
        isLoading: state[ action.payload.submissionId ].isLoading,
        savePending: state[ action.payload.submissionId ].savePending,
      })
    });
  } else {
    return state;
  }
}

/**
 * Updates section visibility.
 *
 * @param state
 *    the current state
 * @param action
 *    a UpdateSectionVisibilityAction
 * @return SubmissionObjectState
 *    the new state, with updated visibility.
 */
function setVisibility(state: SubmissionObjectState, action: UpdateSectionVisibilityAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        sections: Object.assign({}, state[ action.payload.submissionId ].sections, {
          [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ]
            .sections[ action.payload.sectionId ], { visibility: action.payload.visibility })
        })
      })
    });
  } else {
    return state;
  }
}

/**
 * Set a section enabled.
 *
 * @param state
 *    the current state
 * @param action
 *    an InitSectionAction
 * @return SubmissionObjectState
 *    the new state, with the section removed.
 */
function initSection(state: SubmissionObjectState, action: InitSectionAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        sections: Object.assign({}, state[ action.payload.submissionId ].sections, {
          [ action.payload.sectionId ]: {
            header: action.payload.header,
            config: action.payload.config,
            mandatory: action.payload.mandatory,
            opened: action.payload.opened,
            sectionType: action.payload.sectionType,
            visibility: action.payload.visibility,
            collapsed: false,
            enabled: action.payload.enabled,
            data: action.payload.data,
            errorsToShow: [],
            serverValidationErrors: action.payload.errors || [],
            isLoading: false,
            isValid: isEmpty(action.payload.errors),
            removePending: false
          }
        })
      })
    });
  } else {
    return state;
  }
}

/**
 * Set a section form id.
 *
 * @param state
 *    the current state
 * @param action
 *    an SetSectionFormId
 * @return SubmissionObjectState
 *    the new state
 */
function setSectionFormId(state: SubmissionObjectState, action: SetSectionFormId): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        sections: Object.assign({}, state[ action.payload.submissionId ].sections, {
          [ action.payload.sectionId ]: {
            ...state[ action.payload.submissionId ].sections [action.payload.sectionId],
            formId: action.payload.formId
          }
        })
      })
    });
  } else {
    return state;
  }
}

/**
 * Update section's data.
 *
 * @param state
 *    the current state
 * @param action
 *    an UpdateSectionDataAction
 * @return SubmissionObjectState
 *    the new state, with the section's data updated.
 */
function updateSectionData(state: SubmissionObjectState, action: UpdateSectionDataAction): SubmissionObjectState {
  if (isNotEmpty(state[ action.payload.submissionId ])
    && isNotEmpty(state[ action.payload.submissionId ].sections[ action.payload.sectionId])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        sections: Object.assign({}, state[ action.payload.submissionId ].sections, {
          [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections [ action.payload.sectionId ], {
            enabled: true,
            data: action.payload.data,
            errorsToShow: action.payload.errorsToShow,
            serverValidationErrors: action.payload.serverValidationErrors,
            metadata: reduceSectionMetadata(action.payload.metadata, state[ action.payload.submissionId ].sections [ action.payload.sectionId ].metadata)
          })
        })
      })
    });
  } else {
    return state;
  }
}

/**
 * Update section's data.
 *
 * @param state
 *    the current state
 * @param action
 *    an UpdateSectionDataAction
 * @return SubmissionObjectState
 *    the new state, with the section's data updated.
 */
function updateSectionErrors(state: SubmissionObjectState, action: UpdateSectionErrorsAction): SubmissionObjectState {
  if (isNotEmpty(state[ action.payload.submissionId ])
    && isNotEmpty(state[ action.payload.submissionId ].sections[ action.payload.sectionId])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        sections: Object.assign({}, state[ action.payload.submissionId ].sections, {
          [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections [ action.payload.sectionId ], {
            enabled: true,
            errorsToShow: action.payload.errorsToShow,
            serverValidationErrors: action.payload.errorsToShow,
          })
        }),
        savePending: false,
      })
    });
  } else {
    return state;
  }
}

/**
 * Updates the state of the section metadata only when a new value is provided.
 * Keep the existent otherwise.
 * @param newMetadata
 * @param oldMetadata
 * @return
 *   new sectionMetadata value
 */
function reduceSectionMetadata(newMetadata: string[], oldMetadata: string[]): string[] {
  if (newMetadata) {
    return newMetadata;
  }
  if (oldMetadata) {
    return [...oldMetadata];
  }
  return undefined;
}

/**
 * Set a section state.
 *
 * @param state
 *    the current state
 * @param action
 *    a DisableSectionAction
 * @param enabled
 *    enabled or disabled section.
 * @return SubmissionObjectState
 *    the new state, with the section removed.
 */
function changeSectionState(state: SubmissionObjectState, action: EnableSectionAction | DisableSectionAction, enabled: boolean): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ].sections[ action.payload.sectionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        // sections: deleteProperty(state[ action.payload.submissionId ].sections, action.payload.sectionId),
        sections: Object.assign({}, state[ action.payload.submissionId ].sections, {
          [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections [ action.payload.sectionId ], {
            enabled,
            data: (enabled) ? state[ action.payload.submissionId ].sections [ action.payload.sectionId ] : {},
            removePending: false
          })
        })
      })
    });
  } else {
    return state;
  }
}

/**
 * Change removePending flag.
 *
 * @param state
 *    the current state
 * @param action
 *    a DisableSectionAction or a DisableSectionErrorAction
 * @param removePending
 *    representing if remove operation is pending or not.
 * @return SubmissionObjectState
 *    the new state, with the section removed.
 */
function changeSectionRemoveState(state: SubmissionObjectState, action: DisableSectionAction | DisableSectionErrorAction, removePending: boolean): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ].sections[ action.payload.sectionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        // sections: deleteProperty(state[ action.payload.submissionId ].sections, action.payload.sectionId),
        sections: Object.assign({}, state[ action.payload.submissionId ].sections, {
          [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections [ action.payload.sectionId ], {
            removePending
          })
        })
      })
    });
  } else {
    return state;
  }
}

/**
 * Set the section validity.
 *
 * @param state
 *    the current state
 * @param action
 *    a SectionStatusChangeAction
 * @return SubmissionObjectState
 *    the new state, with the section new validity status.
 */
function setIsValid(state: SubmissionObjectState, action: SectionStatusChangeAction): SubmissionObjectState {
  if (isNotEmpty(state[ action.payload.submissionId ]) && hasValue(state[ action.payload.submissionId ].sections[ action.payload.sectionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        sections: Object.assign({}, state[ action.payload.submissionId ].sections,
          Object.assign({}, {
            [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections [ action.payload.sectionId ], {
              isValid: action.payload.status
            })
          })
        )
      })
    });
  } else {
    return state;
  }
}

// ------ Upload file functions ------ //

/**
 * Set a new file.
 *
 * @param state
 *    the current state
 * @param action
 *    a NewUploadedFileAction action
 * @return SubmissionObjectState
 *    the new state, with the new file.
 */
function newFile(state: SubmissionObjectState, action: NewUploadedFileAction): SubmissionObjectState {
  const filesData = state[ action.payload.submissionId ].sections[ action.payload.sectionId ].data as WorkspaceitemSectionUploadObject;
  let newData;
  if (isUndefined(filesData.files)) {
    newData = {
      files: [action.payload.data]
    };
  } else {
    newData = { ...filesData, files: [].concat(...filesData.files, action.payload.data) };
  }

  return Object.assign({}, state, {
    [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
      sections: Object.assign({}, state[ action.payload.submissionId ].sections, {
        [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections [ action.payload.sectionId ], {
          enabled: true,
          data: newData
        })
      })
    })
  });
}

/**
 * Edit a file.
 *
 * @param state
 *    the current state
 * @param action
 *    an EditFileDataAction action
 * @return SubmissionObjectState
 *    the new state, with the edited file.
 */
function editFileData(state: SubmissionObjectState, action: EditFileDataAction): SubmissionObjectState {
  const filesData = state[ action.payload.submissionId ].sections[ action.payload.sectionId ].data as WorkspaceitemSectionUploadObject;
  if (hasValue(filesData.files)) {
    const fileIndex = findKey(
      filesData.files,
      { uuid: action.payload.fileId });
    if (isNotNull(fileIndex)) {
      const newData = Array.from(filesData.files);
      newData[fileIndex] = action.payload.data;
      return Object.assign({}, state, {
        [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
          activeSection: state[ action.payload.submissionId ].activeSection,
          sections: Object.assign({}, state[ action.payload.submissionId ].sections,
            Object.assign({}, {
              [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections [ action.payload.sectionId ], {
                data: Object.assign({}, state[ action.payload.submissionId ].sections[ action.payload.sectionId ].data, {
                  files: newData
                })
              })
            })
          ),
          isLoading: state[ action.payload.submissionId ].isLoading,
          savePending: state[ action.payload.submissionId ].savePending,
        })
      });
    }
  }
  return state;
}

/**
 * Delete a file.
 *
 * @param state
 *    the current state
 * @param action
 *    a DeleteUploadedFileAction action
 * @return SubmissionObjectState
 *    the new state, with the file removed.
 */
function deleteFile(state: SubmissionObjectState, action: DeleteUploadedFileAction): SubmissionObjectState {
  const filesData = state[ action.payload.submissionId ].sections[ action.payload.sectionId ].data as WorkspaceitemSectionUploadObject;
  const filesErrorsToShow = state[ action.payload.submissionId ].sections[ action.payload.sectionId ].errorsToShow ?? [];
  const filesSeverValidationErrors = state[ action.payload.submissionId ].sections[ action.payload.sectionId ].serverValidationErrors ?? [];

  if (hasValue(filesData.files)) {
    const fileIndex: any = findKey(
      filesData.files,
      {uuid: action.payload.fileId});
    if (isNotNull(fileIndex)) {
      const newData = Array.from(filesData.files);
      const newErrorsToShow = filesData.files.length > 1  ? filesErrorsToShow
        .filter(errorToShow => !errorToShow.path.includes(fileIndex)) : [];
      const newServerErrorsToShow = filesData.files.length > 1  ? filesSeverValidationErrors
        .filter(serverError => !serverError.path.includes(fileIndex)) : [];

      newData.splice(fileIndex, 1);
      return Object.assign({}, state, {
        [ action.payload.submissionId ]: Object.assign({}, state[action.payload.submissionId], {
          sections: Object.assign({}, state[action.payload.submissionId].sections,
            Object.assign({}, {
              [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections[ action.payload.sectionId ], {
                data: Object.assign({}, state[ action.payload.submissionId ].sections[ action.payload.sectionId ].data, {
                  files: newData
                }),
                errorsToShow: newErrorsToShow,
                serverValidationErrors: newServerErrorsToShow,
              })
            })
          )
        })
      });
    }
  }
  return state;
}

// ------ Detect duplicate functions ------ //

/**
 * Set decision flag to true
 *
 * @param state
 *    the current state
 * @param action
 *    a SetDuplicateDecisionAction
 * @return SubmissionObjectState
 *    the new state, with the decision flag changed.
 */
function startSaveDecision(state: SubmissionObjectState, action: SetDuplicateDecisionAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        saveDecisionPending: true,
      })
    });
  } else {
    return state;
  }
}

function setDuplicateMatches(state: SubmissionObjectState, action: SetDuplicateDecisionSuccessAction) {
  const index: any = findKey(
    action.payload.submissionObject,
    {id: parseInt(action.payload.submissionId, 10) as any});
  const sectionData = action.payload.submissionObject[index].sections[ action.payload.sectionId ] as WorkspaceitemSectionDetectDuplicateObject;
  const newData = (sectionData && sectionData.matches) ? sectionData : Object.create({});

  if (hasValue(state[ action.payload.submissionId ].sections[ action.payload.sectionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        sections: Object.assign({}, state[ action.payload.submissionId ].sections,
          Object.assign({}, {
            [ action.payload.sectionId ]: Object.assign({}, state[ action.payload.submissionId ].sections [ action.payload.sectionId ], {
              enabled: true,
              data: newData
            })
          })
        ),
        saveDecisionPending: false
      })
    });
  } else {
    return state;
  }
}

/**
 * Set decision flag to false
 *
 * @param state
 *    the current state
 * @param action
 *    a SetDuplicateDecisionSuccessAction or SetDuplicateDecisionErrorAction
 * @return SubmissionObjectState
 *    the new state, with the decision flag changed.
 */
function endSaveDecision(state: SubmissionObjectState, action: SetDuplicateDecisionSuccessAction | SetDuplicateDecisionErrorAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        saveDecisionPending: false,
      })
    });
  } else {
    return state;
  }
}

function cleanDetectDuplicateSection(state: SubmissionObjectState, action: CleanDetectDuplicateAction): SubmissionObjectState {
  if (isNotEmpty(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        sections: Object.assign({}, state[ action.payload.submissionId ].sections, {
          [ 'detect-duplicate' ]: Object.assign({}, state[ action.payload.submissionId ].sections [ 'detect-duplicate' ], {
            enabled: false,
            data: {}
          })
        })
      })
    });
  } else {
    return state;
  }
}

// ------ External upload functions ------ //
/**
 * Set external upload flag to true
 *
 * @param state
 *    the current state
 * @param action
 *    a SetDuplicateDecisionAction
 * @return SubmissionObjectState
 *    the new state, with the decision flag changed.
 */
function startExternalUploadExecution(state: SubmissionObjectState, action: ExecuteExternalUploadAction): SubmissionObjectState {
  if (hasValue(state[ action.payload.submissionId ])) {
    return Object.assign({}, state, {
      [ action.payload.submissionId ]: Object.assign({}, state[ action.payload.submissionId ], {
        externalUploadPending: true,
      })
    });
  } else {
    return state;
  }
}

/**
 * Update external upload state
 *
 * @param state
 *    the current state
 * @param submissionId
 *    the submission's ID
 * @param sectionId
 *    the section's ID
 * @param errors
 *    the section's ID
 * @return SubmissionObjectState
 *    the new state, with the decision flag changed.
 */
function updateExternalUploadState(state: SubmissionObjectState, submissionId: string, sectionId: string, errors: SubmissionSectionError[]): SubmissionObjectState {
  if (isNotEmpty(state[ submissionId ])
    && isNotEmpty(state[ submissionId ].sections[ sectionId])) {
    return Object.assign({}, state, {
      [ submissionId ]: Object.assign({}, state[ submissionId ], {
        sections: Object.assign({}, state[ submissionId ].sections, {
          [ sectionId ]: Object.assign({}, state[ submissionId ].sections [ sectionId ], {
            enabled: true,
            errorsToShow: errors,
            serverValidationErrors: errors,
          })
        }),
        externalUploadPending: false,
      })
    });
  } else {
    return state;
  }
}
