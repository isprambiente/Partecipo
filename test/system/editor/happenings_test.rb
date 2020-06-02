# frozen_string_literal: true

require 'application_system_test_case'

class Editor::HappeningsTest < ApplicationSystemTestCase
  setup do
    @editor_happening = editor_happenings(:one)
  end

  test 'visiting the index' do
    visit editor_happenings_url
    assert_selector 'h1', text: 'Editor/Happenings'
  end

  test 'creating a Happening' do
    visit editor_happenings_url
    click_on 'New Editor/Happening'

    fill_in 'Detail', with: @editor_happening.detail
    fill_in 'Max seats', with: @editor_happening.max_seats
    fill_in 'Max seats for ticket', with: @editor_happening.max_seats_for_ticket
    fill_in 'Start at', with: @editor_happening.start_at
    fill_in 'Start sale at', with: @editor_happening.start_sale_at
    fill_in 'Stop sale at', with: @editor_happening.stop_sale_at
    click_on 'Create Happening'

    assert_text 'Happening was successfully created'
    click_on 'Back'
  end

  test 'updating a Happening' do
    visit editor_happenings_url
    click_on 'Edit', match: :first

    fill_in 'Detail', with: @editor_happening.detail
    fill_in 'Max seats', with: @editor_happening.max_seats
    fill_in 'Max seats for ticket', with: @editor_happening.max_seats_for_ticket
    fill_in 'Start at', with: @editor_happening.start_at
    fill_in 'Start sale at', with: @editor_happening.start_sale_at
    fill_in 'Stop sale at', with: @editor_happening.stop_sale_at
    click_on 'Update Happening'

    assert_text 'Happening was successfully updated'
    click_on 'Back'
  end

  test 'destroying a Happening' do
    visit editor_happenings_url
    page.accept_confirm do
      click_on 'Destroy', match: :first
    end

    assert_text 'Happening was successfully destroyed'
  end
end
