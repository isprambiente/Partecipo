# frozen_string_literal: true

require 'application_system_test_case'

class Editor::FactsTest < ApplicationSystemTestCase
  setup do
    @editor_fact = editor_facts(:one)
  end

  test 'visiting the index' do
    visit editor_facts_url
    assert_selector 'h1', text: 'Editor/Facts'
  end

  test 'creating a Fact' do
    visit editor_facts_url
    click_on 'New Editor/Fact'

    fill_in 'Body', with: @editor_fact.body
    fill_in 'Start on', with: @editor_fact.start_on
    fill_in 'Stop on', with: @editor_fact.stop_on
    fill_in 'Title', with: @editor_fact.title
    click_on 'Create Fact'

    assert_text 'Fact was successfully created'
    click_on 'Back'
  end

  test 'updating a Fact' do
    visit editor_facts_url
    click_on 'Edit', match: :first

    fill_in 'Body', with: @editor_fact.body
    fill_in 'Start on', with: @editor_fact.start_on
    fill_in 'Stop on', with: @editor_fact.stop_on
    fill_in 'Title', with: @editor_fact.title
    click_on 'Update Fact'

    assert_text 'Fact was successfully updated'
    click_on 'Back'
  end

  test 'destroying a Fact' do
    visit editor_facts_url
    page.accept_confirm do
      click_on 'Destroy', match: :first
    end

    assert_text 'Fact was successfully destroyed'
  end
end
