/*
 * Copyright (C) 2018 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import {mount} from 'enzyme'
import {Provider} from 'react-redux'

import * as FlashAlert from 'jsx/shared/FlashAlert'
import * as AssignmentActions from 'jsx/assignments/GradeSummary/assignment/AssignmentActions'
import * as StudentActions from 'jsx/assignments/GradeSummary/students/StudentActions'
import FlashMessageHolder from 'jsx/assignments/GradeSummary/components/FlashMessageHolder'
import configureStore from 'jsx/assignments/GradeSummary/configureStore'

QUnit.module('GradeSummary FlashMessageHolder', suiteHooks => {
  let storeEnv
  let store
  let wrapper

  suiteHooks.beforeEach(() => {
    storeEnv = {
      assignment: {
        courseId: '1201',
        id: '2301',
        title: 'Example Assignment'
      },
      graders: [
        {graderId: '1101', graderName: 'Miss Frizzle'},
        {graderId: '1102', graderName: 'Mr. Keating'}
      ]
    }
    sinon.stub(FlashAlert, 'showFlashAlert')
  })

  suiteHooks.afterEach(() => {
    FlashAlert.showFlashAlert.restore()
    wrapper.unmount()
  })

  function mountComponent() {
    store = configureStore(storeEnv)
    wrapper = mount(
      <Provider store={store}>
        <FlashMessageHolder />
      </Provider>
    )
  }

  QUnit.module('when students fail to load', hooks => {
    hooks.beforeEach(() => {
      mountComponent()
      store.dispatch(StudentActions.setLoadStudentsStatus(StudentActions.FAILURE))
    })

    test('displays a flash alert', () => {
      strictEqual(FlashAlert.showFlashAlert.callCount, 1)
    })

    test('uses the error type', () => {
      const {type} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(type, 'error')
    })

    test('includes a message about loading students', () => {
      const {message} = FlashAlert.showFlashAlert.lastCall.args[0]
      ok(message.includes('loading students'))
    })
  })

  test('does not display a flash alert when publishing grades starts', () => {
    mountComponent()
    store.dispatch(AssignmentActions.setPublishGradesStatus(AssignmentActions.STARTED))
    strictEqual(FlashAlert.showFlashAlert.callCount, 0)
  })

  QUnit.module('when publishing grades succeeds', hooks => {
    hooks.beforeEach(() => {
      mountComponent()
      store.dispatch(AssignmentActions.setPublishGradesStatus(AssignmentActions.SUCCESS))
    })

    test('displays a flash alert', () => {
      strictEqual(FlashAlert.showFlashAlert.callCount, 1)
    })

    test('uses the success type', () => {
      const {type} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(type, 'success')
    })

    test('includes a message about grades being published', () => {
      const {message} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(message, 'Grades were successfully published to the gradebook.')
    })
  })

  QUnit.module('when publishing grades fails for having already been published', hooks => {
    hooks.beforeEach(() => {
      mountComponent()
      store.dispatch(
        AssignmentActions.setPublishGradesStatus(AssignmentActions.GRADES_ALREADY_PUBLISHED)
      )
    })

    test('displays a flash alert', () => {
      strictEqual(FlashAlert.showFlashAlert.callCount, 1)
    })

    test('uses the error type', () => {
      const {type} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(type, 'error')
    })

    test('includes a message about grades already being published', () => {
      const {message} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(message, 'Assignment grades have already been published.')
    })
  })

  QUnit.module('when publishing grades fails for not having all grade selections', hooks => {
    hooks.beforeEach(() => {
      mountComponent()
      store.dispatch(
        AssignmentActions.setPublishGradesStatus(
          AssignmentActions.NOT_ALL_SUBMISSIONS_HAVE_SELECTED_GRADE
        )
      )
    })

    test('displays a flash alert', () => {
      strictEqual(FlashAlert.showFlashAlert.callCount, 1)
    })

    test('uses the error type', () => {
      const {type} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(type, 'error')
    })

    test('includes a message about grades already being published', () => {
      const {message} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(message, 'All submissions must have a selected grade.')
    })
  })

  QUnit.module('when publishing grades fails for some other reason', hooks => {
    hooks.beforeEach(() => {
      mountComponent()
      store.dispatch(AssignmentActions.setPublishGradesStatus(AssignmentActions.FAILURE))
    })

    test('displays a flash alert', () => {
      strictEqual(FlashAlert.showFlashAlert.callCount, 1)
    })

    test('uses the error type', () => {
      const {type} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(type, 'error')
    })

    test('includes a message about grades already being published', () => {
      const {message} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(message, 'There was a problem publishing grades.')
    })
  })

  test('does not display a flash alert when unmuting the assignment starts', () => {
    mountComponent()
    store.dispatch(AssignmentActions.setUnmuteAssignmentStatus(AssignmentActions.STARTED))
    strictEqual(FlashAlert.showFlashAlert.callCount, 0)
  })

  QUnit.module('when unmuting the assignment succeeds', hooks => {
    hooks.beforeEach(() => {
      mountComponent()
      store.dispatch(AssignmentActions.setUnmuteAssignmentStatus(AssignmentActions.SUCCESS))
    })

    test('displays a flash alert', () => {
      strictEqual(FlashAlert.showFlashAlert.callCount, 1)
    })

    test('uses the success type', () => {
      const {type} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(type, 'success')
    })

    test('includes a message about grades being visible to students', () => {
      const {message} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(message, 'Grades for this assignment are now visible to students.')
    })
  })

  QUnit.module('when unmuting the assignment fails', hooks => {
    hooks.beforeEach(() => {
      mountComponent()
      store.dispatch(AssignmentActions.setUnmuteAssignmentStatus(AssignmentActions.FAILURE))
    })

    test('displays a flash alert', () => {
      strictEqual(FlashAlert.showFlashAlert.callCount, 1)
    })

    test('uses the error type', () => {
      const {type} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(type, 'error')
    })

    test('includes a message about updating the assignment', () => {
      const {message} = FlashAlert.showFlashAlert.lastCall.args[0]
      equal(message, 'There was a problem updating the assignment.')
    })
  })
})
