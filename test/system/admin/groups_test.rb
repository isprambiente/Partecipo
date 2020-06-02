# frozen_string_literal: true

require 'application_system_test_case'

class Admin::GroupsTest < ApplicationSystemTestCase
  setup do
    @admin_group = admin_groups(:one)
  end

  test 'visiting the index' do
    visit admin_groups_url
    assert_selector 'h1', text: 'Admin/Groups'
  end

  test 'creating a Group' do
    visit admin_groups_url
    click_on 'New Admin/Group'

    fill_in 'Title', with: @admin_group.title
    fill_in 'User ids', with: @admin_group.user_ids
    click_on 'Create Group'

    assert_text 'Group was successfully created'
    click_on 'Back'
  end

  test 'updating a Group' do
    visit admin_groups_url
    click_on 'Edit', match: :first

    fill_in 'Title', with: @admin_group.title
    fill_in 'User ids', with: @admin_group.user_ids
    click_on 'Update Group'

    assert_text 'Group was successfully updated'
    click_on 'Back'
  end

  test 'destroying a Group' do
    visit admin_groups_url
    page.accept_confirm do
      click_on 'Destroy', match: :first
    end

    assert_text 'Group was successfully destroyed'
  end
end
