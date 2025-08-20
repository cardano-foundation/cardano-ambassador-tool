'use client';

import { useState } from 'react';
import Button from '@/components/atoms/Button';
import LinkButton from '@/components/atoms/LinkButton';
import Radio from '@/components/atoms/Radio';
import TextLink from '@/components/atoms/TextLink';
import Modal, { useModal } from '@/components/atoms/Modal';
import Chip from '@/components/atoms/Chip';
import FolderIcon, { SimpleFolderIcon } from '@/components/atoms/FolderIcon';
import Stepper, { SingleRowStepper, useStepper } from '@/components/atoms/Stepper';
import ToastContainer from '@/components/toast/toast';
import { toast } from '@/components/toast/toast-manager';

export default function ComponentShowcase() {
  const [selectedRadio, setSelectedRadio] = useState('option1');
  const [currentFormStep, setCurrentFormStep] = useState(0);

  // Stepper state management
  const { activeSteps, setActiveStep, nextStep, prevStep, reset } = useStepper(2, 7);

  // Modal state management using the useModal hook
  const unsavedChangesModal = useModal();
  const successModal = useModal();
  const deleteModal = useModal();
  const customModal = useModal();

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRadio(event.target.value);
  };

  // Toast trigger functions
  const showSuccessToast = () => {
    toast.success('Success!', 'Your request was completed successfully. Everything is in order and ready to go.');
  };

  const showErrorToast = () => {
    toast.error('Error encountered', 'We encountered a problem while processing your request.');
  };

  const showWarningToast = () => {
    toast.warning('Heads up', 'There are a few things you might want to double-check before continuing.');
  };

  const showInfoToast = () => {
    toast.info('Just so you know', "Here's some helpful information related to your current activity. No immediate action is required, but it's good to stay informed");
  };

  const showDefaultToast = () => {
    toast.default('Notification', 'This is a general notification message.');
  };

  // Modal handlers
  const handleSaveChanges = () => {
    unsavedChangesModal.closeModal();
    toast.success('Changes Saved', 'Your changes have been saved successfully.');
    // Show success modal after a brief delay
    setTimeout(() => {
      successModal.openModal();
    }, 500);
  };

  const handleDiscardChanges = () => {
    unsavedChangesModal.closeModal();
    toast.warning('Changes Discarded', 'Your changes have been discarded.');
  };

  const handleDeleteConfirm = () => {
    deleteModal.closeModal();
    toast.info('Deleting...', 'Please wait while we delete the item.');

    // Simulate deletion process
    setTimeout(() => {
      toast.success('Item Deleted', 'The item has been successfully deleted.');
    }, 1500);
  };

  const handleSuccessComplete = () => {
    successModal.closeModal();
    toast.info('Process Complete', 'All operations have been completed successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto bg-background">
      {/* Toast Container - this renders all toasts */}
      <ToastContainer />
      <section className="p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Stepper Components</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Multi-Row Stepper</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <Stepper steps={[[0], [2]]} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Interactive Multi-Row Stepper</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <Stepper steps={activeSteps} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setActiveStep(0, 0)}>Row 1 - Step 1</Button>
                <Button size="sm" onClick={() => setActiveStep(0, 3)}>Row 1 - Step 4</Button>
                <Button size="sm" onClick={() => setActiveStep(1, 1)}>Row 2 - Step 2</Button>
                <Button size="sm" onClick={() => setActiveStep(1, 5)}>Row 2 - Step 6</Button>
                <Button size="sm" variant="outline" onClick={reset}>Reset</Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Progress Stepper (Single Row)</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <SingleRowStepper currentStep={currentFormStep} totalSteps={5} />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentFormStep(Math.max(0, currentFormStep - 1))}
                  disabled={currentFormStep === 0}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCurrentFormStep(Math.min(4, currentFormStep + 1))}
                  disabled={currentFormStep === 4}
                >
                  Next
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCurrentFormStep(0)}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Icon Demo Section */}
      <section className="p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">File Icon</h2>

        <div className="space-y-6"><div>
            <div className="flex flex-wrap items-center gap-4">
              <FolderIcon variant="light" width={40} height={40} />
              <FolderIcon variant="light" width={60} height={60} />
              <FolderIcon variant="light" width={80} height={80} />
            </div>
          </div>
        </div>
      </section>

      {/* Chip Demo Section */}
      <section className="p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Chip Components</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Chip Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Chip variant="default">Default Chip</Chip>
              <Chip variant="success">Success Chip</Chip>
              <Chip variant="inactive">Inactive Chip</Chip>
              <Chip variant="error">Error</Chip>
              <Chip variant="warning">Warning</Chip>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Demo Section */}
      <section className="p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Modal Components</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Modal Types</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={unsavedChangesModal.openModal}>
                Unsaved Changes Modal
              </Button>
              <Button variant="success" onClick={successModal.openModal}>
                Success Modal
              </Button>
              <Button variant="warning" onClick={deleteModal.openModal}>
                Delete Confirmation
              </Button>
              <Button variant="outline" onClick={customModal.openModal}>
                Custom Modal
              </Button>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Modal */}
        <Modal
          isOpen={unsavedChangesModal.isOpen}
          onClose={unsavedChangesModal.closeModal}
          title="Unsaved changes"
          message="You have made changes to your proposal. Do you want to save or discard them?"
          actions={[
            {
              label: "Discard",
              variant: "outline",
              onClick: handleDiscardChanges,
            },
            {
              label: "Save Changes",
              variant: "primary",
              onClick: handleSaveChanges,
            },
          ]}
        />

        {/* Success Modal */}
        <Modal
          isOpen={successModal.isOpen}
          onClose={handleSuccessComplete}
          title="Success"
          message="Your request was completed successfully. Everything is in order and ready to go."
          actions={[
            {
              label: "Complete",
              variant: "primary",
              onClick: handleSuccessComplete,
            },
          ]}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.closeModal}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          actions={[
            {
              label: "Cancel",
              variant: "outline",
              onClick: deleteModal.closeModal,
            },
            {
              label: "Delete",
              variant: "warning",
              onClick: handleDeleteConfirm,
            },
          ]}
        />

        {/* Custom Modal with multiple actions */}
        <Modal
          isOpen={customModal.isOpen}
          onClose={customModal.closeModal}
          title="Multiple Actions"
          message="Choose how you want to proceed with your document."
          actions={[
            {
              label: "Cancel",
              variant: "outline",
              onClick: customModal.closeModal,
            },
            {
              label: "Save Draft",
              variant: "secondary",
              onClick: () => {
                customModal.closeModal();
                toast.info("Draft Saved", "Your document has been saved as a draft.");
              },
            },
            {
              label: "Publish",
              variant: "primary",
              onClick: () => {
                customModal.closeModal();
                toast.success("Published", "Your document has been published successfully.");
              },
            },
          ]}
        />
      </section>

      {/* Toast Demo Section */}
      <section className="p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Toast Components</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Toast Types</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="success" onClick={showSuccessToast}>
                Show Success Toast
              </Button>
              <Button variant="warning" onClick={showErrorToast}>
                Show Error Toast
              </Button>
              <Button variant="outline" onClick={showWarningToast}>
                Show Warning Toast
              </Button>
              <Button variant="primary" onClick={showInfoToast}>
                Show Info Toast
              </Button>
              <Button variant="ghost" onClick={showDefaultToast}>
                Show Default Toast
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Toast Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  showSuccessToast();
                  showWarningToast();
                  showInfoToast();
                }}
              >
                Show Multiple Toasts
              </Button>
              <Button variant="outline" onClick={() => toast.clearAll()}>
                Clear All Toasts
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Button Components</h2>

        <div className="space-y-6">
          {/* All Button Variants */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Button Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="success">Success</Button>
              <Button variant="primary-light">Primary Light</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">LinkButton Components</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">LinkButton Variants</h3>
            <div className="flex flex-wrap gap-3">
              <LinkButton variant="primary" href="#test">Primary Link</LinkButton>
              <LinkButton variant="secondary" href="#test">Secondary Link</LinkButton>
              <LinkButton variant="outline" href="#test">Outline Link</LinkButton>
              <LinkButton variant="warning" href="#test">Warning Link</LinkButton>
              <LinkButton variant="success" href="#test">Success Link</LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Radio Components */}
      <section className="p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Radio Components</h2>

        <div className="space-y-6">
          {/* Basic Radio Group */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Radio Group</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <Radio
                  name="test-group"
                  value="option1"
                  checked={selectedRadio === 'option1'}
                  onChange={(e) => {
                    handleRadioChange(e);
                    toast.info('Radio Selected', `You selected ${e.target.value}`);
                  }}
                />
                <span className="text-sm font-medium text-gray-700">Option 1</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Radio
                  name="test-group"
                  value="option2"
                  checked={selectedRadio === 'option2'}
                  onChange={(e) => {
                    handleRadioChange(e);
                    toast.info('Radio Selected', `You selected ${e.target.value}`);
                  }}
                />
                <span className="text-sm font-medium text-gray-700">Option 2</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Radio
                  name="test-group"
                  value="option3"
                  checked={selectedRadio === 'option3'}
                  onChange={(e) => {
                    handleRadioChange(e);
                    toast.info('Radio Selected', `You selected ${e.target.value}`);
                  }}
                />
                <span className="text-sm font-medium text-gray-700">Option 3</span>
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">Selected: {selectedRadio}</p>
          </div>

          {/* Radio States */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Radio States</h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-3">
                <Radio name="states" value="normal" />
                <span className="text-sm font-medium text-gray-700">Normal</span>
              </label>
              <label className="flex items-center gap-3">
                <Radio name="states" value="checked" checked />
                <span className="text-sm font-medium text-gray-700">Checked</span>
              </label>
              <label className="flex items-center gap-3 opacity-50">
                <Radio name="states" value="disabled" disabled />
                <span className="text-sm font-medium text-gray-700">Disabled</span>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}