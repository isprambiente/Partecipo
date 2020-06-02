# frozen_string_literal: true

require 'application_system_test_case'

class FactsTest < ApplicationSystemTestCase
  setup do
    @fact = facts(:one)
  end

  test 'visiting the index' do
    visit facts_url
    assert_selector 'h1', text: 'Facts'
  end

  test 'creating a Fact' do
    visit facts_url
    click_on 'New Fact'

    fill_in 'Title', with: @fact.title
    click_on 'Create Fact'

    assert_text 'Fact was successfully created'
    click_on 'Back'
  end

  test 'updating a Fact' do
    visit facts_url
    click_on 'Edit', match: :first

    fill_in 'Title', with: @fact.title
    click_on 'Update Fact'

    assert_text 'Fact was successfully updated'
    click_on 'Back'
  end

  test 'destroying a Fact' do
    visit facts_url
    page.accept_confirm do
      click_on 'Destroy', match: :first
    end

    assert_text 'Fact was successfully destroyed'
  end
end
